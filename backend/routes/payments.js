const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const auth = require('../middleware/auth');
const { attachCustomerContext, requireRoles } = require('../middleware/rbac');

const mockPayments = [
  { _id: 'p1', paymentId: 'PAY-00000001', billId: 'BILL-00000001', customerId: 'CUST-001', amount: 1072.5, method: 'credit_card', status: 'success', transactionId: 'TXN-ABC123', paidAt: '2024-02-10T10:30:00Z' },
  { _id: 'p2', paymentId: 'PAY-00000002', billId: 'BILL-00000002', customerId: 'CUST-002', amount: 1500, method: 'net_banking', status: 'success', transactionId: 'TXN-DEF456', paidAt: '2024-02-12T14:20:00Z' },
];
let mockPaymentsDb = [...mockPayments];

router.use(auth, attachCustomerContext);

const getBillByAnyId = async (billId) => {
  const Bill = require('../models/Bill');
  return (await Bill.findById(billId)) || (await Bill.findOne({ billId }));
};

const ensureCustomerBillAccess = async (req, res, billId, customerId) => {
  if (req.user.role !== 'customer') return true;

  if (customerId !== req.customerContext.customerId) {
    res.status(403).json({ error: 'Forbidden: customer mismatch' });
    return false;
  }

  try {
    const bill = await getBillByAnyId(billId);
    if (!bill || bill.customerId !== req.customerContext.customerId) {
      res.status(403).json({ error: 'Forbidden: you can only pay your own bills' });
      return false;
    }
  } catch {
    const mockBill = mockPaymentsDb.find(p => p.billId === billId && p.customerId === req.customerContext.customerId);
    if (!mockBill && billId) {
      // If DB check is not available, still allow only when customerId matches own context.
      return true;
    }
  }

  return true;
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const getStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) return null;
  return new Stripe(key);
};

const processStripeCardPayment = async ({ amount, method }) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return {
      status: 'failed',
      transactionId: null,
      stripePaymentId: null,
      gatewayMessage: 'Stripe is not configured. Set STRIPE_SECRET_KEY in backend .env'
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'inr',
      confirm: true,
      payment_method: 'pm_card_visa',
      description: `UBCMS ${method} payment`
    });

    const succeeded = paymentIntent.status === 'succeeded';
    return {
      status: succeeded ? 'success' : 'failed',
      transactionId: succeeded ? paymentIntent.id : null,
      stripePaymentId: paymentIntent.id,
      gatewayMessage: succeeded ? 'Payment successful via Stripe' : `Stripe status: ${paymentIntent.status}`
    };
  } catch (err) {
    return {
      status: 'failed',
      transactionId: null,
      stripePaymentId: null,
      gatewayMessage: err.message || 'Stripe payment failed'
    };
  }
};

const processOfflineTransfer = ({ method }) => ({
  status: 'pending',
  transactionId: `BNK-${Date.now()}`,
  stripePaymentId: null,
  gatewayMessage: `${method.toUpperCase()} request created. Awaiting finance confirmation.`
});

// GET all payments
router.get('/', async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const query = req.user.role === 'customer'
      ? { customerId: req.customerContext.customerId }
      : {};
    const payments = await Payment.find(query).sort({ paidAt: -1 });
    res.json(payments);
  } catch {
    if (req.user.role === 'customer') {
      return res.json(mockPaymentsDb.filter(p => p.customerId === req.customerContext?.customerId));
    }
    res.json(mockPaymentsDb);
  }
});

// POST create Razorpay order for UPI checkout
router.post('/razorpay/order', requireRoles('admin', 'staff', 'customer'), async (req, res) => {
  const { billId, customerId, amount } = req.body;

  if (!billId || !customerId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'billId, customerId and valid amount are required' });
  }

  if (!(await ensureCustomerBillAccess(req, res, billId, customerId))) return;

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return res.status(500).json({ error: 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `ubcms_${Date.now()}`,
      notes: { billId, customerId }
    });

    return res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      billId,
      customerId
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

// POST verify Razorpay payment signature and persist payment
router.post('/razorpay/verify', requireRoles('admin', 'staff', 'customer'), async (req, res) => {
  const {
    billId,
    customerId,
    amount,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!billId || !customerId || !amount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay verification details' });
  }

  if (!(await ensureCustomerBillAccess(req, res, billId, customerId))) return;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Razorpay secret is not configured' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid Razorpay signature' });
  }

  const paymentData = {
    billId,
    customerId,
    amount,
    method: 'upi',
    status: 'success',
    transactionId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    paidAt: new Date()
  };

  try {
    const Payment = require('../models/Payment');
    const payment = new Payment(paymentData);
    await payment.save();

    try {
      const Bill = require('../models/Bill');
      await Bill.findByIdAndUpdate(billId, { status: 'paid', paymentDate: new Date() });
    } catch {}

    return res.status(201).json({ ...paymentData, _id: payment._id, paymentId: payment.paymentId, message: 'UPI payment successful!' });
  } catch {
    const newPayment = { ...paymentData, _id: Date.now().toString(), paymentId: 'PAY-' + Date.now().toString().slice(-8) };
    mockPaymentsDb.push(newPayment);
    return res.status(201).json({ ...newPayment, message: 'UPI payment successful!' });
  }
});

// POST process payment
router.post('/process', requireRoles('admin', 'staff', 'customer'), async (req, res) => {
  const { billId, customerId, amount, method, cardDetails } = req.body;

  if (method === 'upi') {
    return res.status(400).json({ error: 'Use /api/payments/razorpay/order for UPI transactions' });
  }

  const supportedMethods = ['credit_card', 'debit_card', 'net_banking', 'cash', 'bank_transfer', 'neft', 'rtgs'];
  const resolvedMethod = method || 'credit_card';
  if (!supportedMethods.includes(resolvedMethod)) {
    return res.status(400).json({ error: 'Unsupported payment method' });
  }

  if (!(await ensureCustomerBillAccess(req, res, billId, customerId))) return;

  let gatewayResult;
  if (resolvedMethod === 'credit_card' || resolvedMethod === 'debit_card') {
    gatewayResult = await processStripeCardPayment({ amount, method: resolvedMethod });
  } else if (resolvedMethod === 'bank_transfer' || resolvedMethod === 'neft' || resolvedMethod === 'rtgs') {
    gatewayResult = processOfflineTransfer({ method: resolvedMethod });
  } else {
    // Net banking and cash are handled with immediate simulated gateway response.
    const success = Math.random() > 0.05;
    gatewayResult = {
      status: success ? 'success' : 'failed',
      transactionId: success ? 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase() : null,
      stripePaymentId: null,
      gatewayMessage: success ? 'Payment successful' : 'Payment failed. Please try again.'
    };
  }

  const paymentData = {
    billId, customerId, amount,
    method: resolvedMethod,
    status: gatewayResult.status,
    transactionId: gatewayResult.transactionId,
    stripePaymentId: gatewayResult.stripePaymentId,
    paidAt: new Date()
  };

  try {
    const Payment = require('../models/Payment');
    const payment = new Payment(paymentData);
    await payment.save();

    // Update bill status if payment succeeded
    if (gatewayResult.status === 'success') {
      try {
        const Bill = require('../models/Bill');
        await Bill.findByIdAndUpdate(billId, { status: 'paid', paymentDate: new Date() });
      } catch {}
    }

    res.status(201).json({ ...paymentData, message: gatewayResult.gatewayMessage });
  } catch {
    const newPayment = { ...paymentData, _id: Date.now().toString(), paymentId: 'PAY-' + Date.now().toString().slice(-8) };
    mockPaymentsDb.push(newPayment);
    res.status(201).json({ ...newPayment, message: gatewayResult.gatewayMessage });
  }
});

module.exports = router;
