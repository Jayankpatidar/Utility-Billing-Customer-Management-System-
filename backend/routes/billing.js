const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRoles, attachCustomerContext } = require('../middleware/rbac');
const { deliverBill } = require('../services/billDelivery');

const TARIFF_CONFIG = {
  standard: { basicCharge: 50, ratePerUnit: 5 },
  premium: { basicCharge: 75, ratePerUnit: 6 },
  commercial: { basicCharge: 100, ratePerUnit: 7 }
};

const mockBills = [
  { _id: 'b1', billId: 'BILL-00000001', customerId: 'CUST-001', customerName: 'Rajesh Kumar', billingPeriod: { from: '2024-01-01', to: '2024-01-31' }, usage: { previousReading: 1200, currentReading: 1385, unitsConsumed: 185 }, charges: { basicCharge: 50, usageCharge: 925, taxes: 97.5, discount: 0, totalAmount: 1072.5 }, dueDate: '2024-02-15', status: 'paid', generatedAt: '2024-02-01' },
  { _id: 'b2', billId: 'BILL-00000002', customerId: 'CUST-002', customerName: 'Priya Sharma', billingPeriod: { from: '2024-01-01', to: '2024-01-31' }, usage: { previousReading: 5400, currentReading: 5820, unitsConsumed: 420 }, charges: { basicCharge: 100, usageCharge: 2940, taxes: 304, discount: 50, totalAmount: 3294 }, dueDate: '2024-02-15', status: 'pending', generatedAt: '2024-02-01' },
  { _id: 'b3', billId: 'BILL-00000003', customerId: 'CUST-004', customerName: 'Sunita Verma', billingPeriod: { from: '2024-01-01', to: '2024-01-31' }, usage: { previousReading: 2100, currentReading: 2290, unitsConsumed: 190 }, charges: { basicCharge: 50, usageCharge: 950, taxes: 100, discount: 25, totalAmount: 1075 }, dueDate: '2024-02-15', status: 'overdue', generatedAt: '2024-02-01' },
  { _id: 'b4', billId: 'BILL-00000004', customerId: 'CUST-001', customerName: 'Rajesh Kumar', billingPeriod: { from: '2024-02-01', to: '2024-02-29' }, usage: { previousReading: 1385, currentReading: 1560, unitsConsumed: 175 }, charges: { basicCharge: 50, usageCharge: 875, taxes: 92.5, discount: 0, totalAmount: 1017.5 }, dueDate: '2024-03-15', status: 'pending', generatedAt: '2024-03-01' },
];

let mockBillsDb = [...mockBills];

router.use(auth, attachCustomerContext);

// GET all bills
router.get('/', async (req, res) => {
  try {
    const Bill = require('../models/Bill');
    const query = req.user.role === 'customer'
      ? { customerId: req.customerContext.customerId }
      : {};
    const bills = await Bill.find(query).sort({ generatedAt: -1 });
    res.json(bills);
  } catch {
    if (req.user.role === 'customer') {
      return res.json(mockBillsDb.filter(b => b.customerId === req.customerContext?.customerId));
    }
    res.json(mockBillsDb);
  }
});

// GET bills by customer
router.get('/customer/:customerId', async (req, res) => {
  if (req.user.role === 'customer' && req.params.customerId !== req.customerContext.customerId) {
    return res.status(403).json({ error: 'Forbidden: you can only access your own bills' });
  }

  try {
    const Bill = require('../models/Bill');
    const bills = await Bill.find({ customerId: req.params.customerId });
    res.json(bills);
  } catch {
    res.json(mockBillsDb.filter(b => b.customerId === req.params.customerId));
  }
});

// GET single bill
router.get('/:id', async (req, res) => {
  try {
    const Bill = require('../models/Bill');
    const bill = await Bill.findById(req.params.id) || await Bill.findOne({ billId: req.params.id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    if (req.user.role === 'customer' && bill.customerId !== req.customerContext.customerId) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own bills' });
    }

    res.json(bill);
  } catch {
    const b = mockBillsDb.find(b => b._id === req.params.id || b.billId === req.params.id);
    if (!b) return res.status(404).json({ error: 'Bill not found' });

    if (req.user.role === 'customer' && b.customerId !== req.customerContext?.customerId) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own bills' });
    }

    res.json(b);
  }
});

// POST generate bill
router.post('/generate', requireRoles('admin', 'staff'), async (req, res) => {
  const {
    customerId,
    customerName,
    previousReading,
    currentReading,
    billingFrom,
    billingTo,
    tariffPlan,
    discount = 0,
    deliveryMethod
  } = req.body;

  const unitsConsumed = Number(currentReading) - Number(previousReading);
  if (!Number.isFinite(unitsConsumed) || unitsConsumed < 0) {
    return res.status(400).json({ error: 'Current reading must be greater than or equal to previous reading' });
  }

  let customer = null;
  try {
    const Customer = require('../models/Customer');
    customer = await Customer.findOne({ customerId });
  } catch {}

  const resolvedPlan = customer?.tariffPlan || tariffPlan || 'standard';
  const tariff = TARIFF_CONFIG[resolvedPlan] || TARIFF_CONFIG.standard;
  const basicCharge = tariff.basicCharge;
  const ratePerUnit = tariff.ratePerUnit;

  const usageCharge = unitsConsumed * ratePerUnit;
  const subTotal = basicCharge + usageCharge;
  const taxes = subTotal * 0.1;
  const normalizedDiscount = Math.max(0, Number(discount) || 0);
  const totalAmount = Math.max(0, subTotal + taxes - normalizedDiscount);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);

  const resolvedDeliveryMethod = customer?.preferredDeliveryMethod || deliveryMethod || 'email';

  const billData = {
    customerId,
    customerName: customer?.name || customerName,
    tariffPlan: resolvedPlan,
    ratePerUnit,
    billingPeriod: { from: billingFrom, to: billingTo },
    usage: { previousReading, currentReading, unitsConsumed },
    charges: {
      basicCharge,
      usageCharge,
      taxes: Math.round(taxes * 100) / 100,
      discount: Math.round(normalizedDiscount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    },
    dueDate,
    status: 'pending',
    delivery: {
      method: resolvedDeliveryMethod,
      status: 'queued'
    }
  };

  try {
    const Bill = require('../models/Bill');
    let bill = new Bill(billData);
    await bill.save();

    const deliveryResult = await deliverBill({
      bill,
      customer: {
        email: customer?.email,
        name: customer?.name || customerName,
        preferredDeliveryMethod: resolvedDeliveryMethod
      }
    });

    bill.delivery = deliveryResult;
    await bill.save();

    res.status(201).json(bill);
  } catch (err) {
    const fallbackDelivery = await deliverBill({
      bill: { ...billData, billId: 'BILL-' + Date.now().toString().slice(-8) },
      customer: {
        email: customer?.email,
        name: customer?.name || customerName,
        preferredDeliveryMethod: resolvedDeliveryMethod
      }
    }).catch(() => ({ method: resolvedDeliveryMethod, status: 'queued', error: 'Delivery simulation failed' }));

    const newBill = {
      ...billData,
      _id: Date.now().toString(),
      billId: 'BILL-' + Date.now().toString().slice(-8),
      generatedAt: new Date().toISOString(),
      delivery: fallbackDelivery
    };
    mockBillsDb.push(newBill);
    res.status(201).json(newBill);
  }
});

// PUT update bill status
router.put('/:id', requireRoles('admin', 'staff'), async (req, res) => {
  try {
    const Bill = require('../models/Bill');
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bill);
  } catch {
    const idx = mockBillsDb.findIndex(b => b._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Bill not found' });
    mockBillsDb[idx] = { ...mockBillsDb[idx], ...req.body };
    res.json(mockBillsDb[idx]);
  }
});

module.exports = router;
