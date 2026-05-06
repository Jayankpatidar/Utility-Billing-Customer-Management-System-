const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: { type: String, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String },
  tariffPlan: { type: String, enum: ['standard', 'premium', 'commercial'], default: 'standard' },
  ratePerUnit: { type: Number, default: 5 },
  billingPeriod: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  usage: {
    previousReading: { type: Number, default: 0 },
    currentReading: { type: Number, required: true },
    unitsConsumed: { type: Number }
  },
  charges: {
    basicCharge: { type: Number, default: 0 },
    usageCharge: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending' },
  paymentDate: { type: Date },
  delivery: {
    method: { type: String, enum: ['email', 'postal'], default: 'email' },
    status: { type: String, enum: ['sent', 'queued', 'failed'], default: 'queued' },
    sentAt: { type: Date },
    error: { type: String }
  },
  generatedAt: { type: Date, default: Date.now }
});

billSchema.pre('save', function(next) {
  if (!this.billId) {
    this.billId = 'BILL-' + Date.now().toString().slice(-8);
  }
  if (this.usage.currentReading && this.usage.previousReading !== undefined) {
    this.usage.unitsConsumed = this.usage.currentReading - this.usage.previousReading;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
