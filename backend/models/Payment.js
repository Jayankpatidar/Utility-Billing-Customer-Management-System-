const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true },
  billId: { type: String, required: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash', 'bank_transfer', 'neft', 'rtgs'], default: 'credit_card' },
  status: { type: String, enum: ['success', 'failed', 'pending', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  stripePaymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paidAt: { type: Date, default: Date.now }
});

paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = 'PAY-' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
