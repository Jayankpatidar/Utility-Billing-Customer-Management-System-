const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRoles, attachCustomerContext } = require('../middleware/rbac');
const { validateCustomer } = require('../utils/validators');

// Mock data fallback
const mockCustomers = [
  { _id: '1', customerId: 'CUST-001', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210', accountType: 'residential', status: 'active', meterNumber: 'MTR-1001', tariffPlan: 'standard', address: { city: 'Mumbai', state: 'Maharashtra' } },
  { _id: '2', customerId: 'CUST-002', name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', accountType: 'commercial', status: 'active', meterNumber: 'MTR-1002', tariffPlan: 'commercial', address: { city: 'Delhi', state: 'Delhi' } },
  { _id: '3', customerId: 'CUST-003', name: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', accountType: 'residential', status: 'inactive', meterNumber: 'MTR-1003', tariffPlan: 'standard', address: { city: 'Ahmedabad', state: 'Gujarat' } },
  { _id: '4', customerId: 'CUST-004', name: 'Sunita Verma', email: 'sunita@email.com', phone: '9876543213', accountType: 'residential', status: 'active', meterNumber: 'MTR-1004', tariffPlan: 'premium', address: { city: 'Indore', state: 'MP' } },
  { _id: '5', customerId: 'CUST-005', name: 'Tech Corp Ltd', email: 'tech@corp.com', phone: '9876543214', accountType: 'commercial', status: 'suspended', meterNumber: 'MTR-1005', tariffPlan: 'commercial', address: { city: 'Bangalore', state: 'Karnataka' } },
];

let mockDb = [...mockCustomers];

router.use(auth, attachCustomerContext);

// GET own customer profile
router.get('/me', requireRoles('customer'), async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    const customer = await Customer.findOne({ email: req.user.email });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    return res.json(customer);
  } catch {
    const customer = mockDb.find(c => c.email === req.user.email);
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    return res.json(customer);
  }
});

// PUT update own customer profile
router.put('/me', requireRoles('customer'), async (req, res) => {
  const allowed = ['name', 'phone', 'address', 'preferredDeliveryMethod'];
  const payload = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }

  // Validate phone if provided
  if (payload.phone) {
    const validation = validateCustomer({ phone: payload.phone, email: 'dummy@example.com' });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.find(e => e.includes('Phone')) || 'Invalid data' });
    }
  }

  try {
    const Customer = require('../models/Customer');
    const customer = await Customer.findOneAndUpdate(
      { email: req.user.email },
      payload,
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    return res.json(customer);
  } catch {
    const idx = mockDb.findIndex(c => c.email === req.user.email);
    if (idx === -1) return res.status(404).json({ error: 'Customer profile not found' });
    mockDb[idx] = { ...mockDb[idx], ...payload };
    return res.json(mockDb[idx]);
  }
});

// GET all customers
router.get('/', async (req, res) => {
  if (req.user.role === 'customer') {
    try {
      const Customer = require('../models/Customer');
      const customer = await Customer.findOne({ email: req.user.email });
      return res.json(customer ? [customer] : []);
    } catch {
      return res.json(mockDb.filter(c => c.email === req.user.email));
    }
  }

  try {
    const Customer = require('../models/Customer');
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch {
    res.json(mockDb);
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    const customer = await Customer.findById(req.params.id) || await Customer.findOne({ customerId: req.params.id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    if (req.user.role === 'customer') {
      const ownCustomer = req.customerContext;
      if (!ownCustomer || (String(customer._id) !== ownCustomer.dbId && customer.customerId !== ownCustomer.customerId)) {
        return res.status(403).json({ error: 'Forbidden: you can only access your own account' });
      }
    }

    res.json(customer);
  } catch {
    const c = mockDb.find(c => c._id === req.params.id || c.customerId === req.params.id);
    if (!c) return res.status(404).json({ error: 'Customer not found' });

    if (req.user.role === 'customer' && c.email !== req.user.email) {
      return res.status(403).json({ error: 'Forbidden: you can only access your own account' });
    }

    res.json(c);
  }
});

// POST create customer
router.post('/', requireRoles('admin', 'staff'), async (req, res) => {
  // Validate input
  const validation = validateCustomer(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors.join(', ') });
  }

  try {
    const Customer = require('../models/Customer');
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch {
    const newCustomer = { ...req.body, _id: Date.now().toString(), customerId: 'CUST-' + Date.now().toString().slice(-6) };
    mockDb.push(newCustomer);
    res.status(201).json(newCustomer);
  }
});

// PUT update customer
router.put('/:id', requireRoles('admin', 'staff'), async (req, res) => {
  // Validate input
  const validation = validateCustomer(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors.join(', ') });
  }

  try {
    const Customer = require('../models/Customer');
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch {
    const idx = mockDb.findIndex(c => c._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Customer not found' });
    mockDb[idx] = { ...mockDb[idx], ...req.body };
    res.json(mockDb[idx]);
  }
});

// DELETE customer
router.delete('/:id', requireRoles('admin', 'staff'), async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch {
    mockDb = mockDb.filter(c => c._id !== req.params.id);
    res.json({ message: 'Customer deleted' });
  }
});

module.exports = router;
