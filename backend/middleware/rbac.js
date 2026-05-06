const requireRoles = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
};

const attachCustomerContext = async (req, res, next) => {
  if (req.user?.role !== 'customer') return next();

  try {
    const Customer = require('../models/Customer');
    const customer = await Customer.findOne({ email: req.user.email });

    if (!customer) {
      return res.status(403).json({ error: 'Customer profile not found for this user' });
    }

    req.customerContext = {
      dbId: String(customer._id),
      customerId: customer.customerId,
      email: customer.email
    };

    return next();
  } catch {
    return res.status(500).json({ error: 'Unable to load customer access context' });
  }
};

module.exports = { requireRoles, attachCustomerContext };
