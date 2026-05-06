const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  accountType: { type: String, enum: ['residential', 'commercial'], default: 'residential' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  meterNumber: { type: String, unique: true, sparse: true },
  tariffPlan: { type: String, default: 'standard' },
  preferredDeliveryMethod: { type: String, enum: ['email', 'postal'], default: 'email' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

customerSchema.pre('save', function(next) {
  if (!this.customerId) {
    this.customerId = 'CUST-' + Date.now().toString().slice(-6);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
