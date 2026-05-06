const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

// Mock users for demo (when DB not connected)
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@ubcms.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'admin' }, // password: password
  { id: '2', name: 'Staff User', email: 'staff@ubcms.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'staff' }
];

const validateMockUser = async (email, password) => {
  const mockUser = mockUsers.find(u => u.email === email);
  if (!mockUser) return null;
  const isMatch = await bcrypt.compare(password, mockUser.password);
  return isMatch ? mockUser : null;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    let user;
    try {
      const User = require('../models/User');
      user = await User.findOne({ email });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
      } else {
        user = await validateMockUser(email, password);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      }
    } catch (dbErr) {
      // Fallback to mock users
      user = await validateMockUser(email, password);
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'ubcms_secret',
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', auth, requireRoles('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const User = require('../models/User');
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const user = new User({ name, email, password, role: role || 'staff' });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
