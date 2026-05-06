const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ubcms';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Reset test collections for repeatable local testing.
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Bill.deleteMany({}),
    Payment.deleteMany({})
  ]);

  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@ubcms.com',
      password: 'password',
      role: 'admin'
    },
    {
      name: 'Staff User',
      email: 'staff@ubcms.com',
      password: 'password',
      role: 'staff'
    },
    {
      name: 'Customer User',
      email: 'customer@ubcms.com',
      password: 'password',
      role: 'customer'
    }
  ]);

  const customers = await Customer.insertMany([
    {
      customerId: 'CUST-001',
      name: 'Rajesh Kumar',
      email: 'rajesh@email.com',
      phone: '9876543210',
      address: {
        street: '11 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001'
      },
      accountType: 'residential',
      status: 'active',
      meterNumber: 'MTR-1001',
      tariffPlan: 'standard',
      preferredDeliveryMethod: 'email'
    },
    {
      customerId: 'CUST-002',
      name: 'Priya Sharma',
      email: 'priya@email.com',
      phone: '9876543211',
      address: {
        street: '22 Connaught Place',
        city: 'Delhi',
        state: 'Delhi',
        zip: '110001'
      },
      accountType: 'commercial',
      status: 'active',
      meterNumber: 'MTR-1002',
      tariffPlan: 'commercial',
      preferredDeliveryMethod: 'email'
    },
    {
      customerId: 'CUST-003',
      name: 'Amit Patel',
      email: 'amit@email.com',
      phone: '9876543212',
      address: {
        street: '33 CG Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zip: '380009'
      },
      accountType: 'residential',
      status: 'inactive',
      meterNumber: 'MTR-1003',
      tariffPlan: 'standard',
      preferredDeliveryMethod: 'postal'
    },
    {
      customerId: 'CUST-004',
      name: 'Sunita Verma',
      email: 'sunita@email.com',
      phone: '9876543213',
      address: {
        street: '44 AB Road',
        city: 'Indore',
        state: 'Madhya Pradesh',
        zip: '452001'
      },
      accountType: 'residential',
      status: 'active',
      meterNumber: 'MTR-1004',
      tariffPlan: 'premium',
      preferredDeliveryMethod: 'email'
    },
    {
      customerId: 'CUST-005',
      name: 'Tech Corp Ltd',
      email: 'tech@corp.com',
      phone: '9876543214',
      address: {
        street: '55 Electronic City',
        city: 'Bengaluru',
        state: 'Karnataka',
        zip: '560100'
      },
      accountType: 'commercial',
      status: 'suspended',
      meterNumber: 'MTR-1005',
      tariffPlan: 'commercial',
      preferredDeliveryMethod: 'postal'
    },
    {
      customerId: 'CUST-006',
      name: 'Customer User',
      email: 'customer@ubcms.com',
      phone: '9876543220',
      address: {
        street: '66 Ring Road',
        city: 'Pune',
        state: 'Maharashtra',
        zip: '411001'
      },
      accountType: 'residential',
      status: 'active',
      meterNumber: 'MTR-1006',
      tariffPlan: 'standard',
      preferredDeliveryMethod: 'email'
    }
  ]);

  const bills = await Bill.insertMany([
    {
      billId: 'BILL-00000001',
      customerId: 'CUST-001',
      customerName: 'Rajesh Kumar',
      billingPeriod: { from: new Date('2026-03-01'), to: new Date('2026-03-31') },
      usage: { previousReading: 1200, currentReading: 1385, unitsConsumed: 185 },
      charges: { basicCharge: 50, usageCharge: 925, taxes: 97.5, discount: 0, totalAmount: 1072.5 },
      dueDate: new Date('2026-04-15'),
      status: 'paid',
      paymentDate: new Date('2026-04-08')
    },
    {
      billId: 'BILL-00000002',
      customerId: 'CUST-002',
      customerName: 'Priya Sharma',
      billingPeriod: { from: new Date('2026-03-01'), to: new Date('2026-03-31') },
      usage: { previousReading: 5400, currentReading: 5820, unitsConsumed: 420 },
      charges: { basicCharge: 100, usageCharge: 2940, taxes: 304, discount: 50, totalAmount: 3294 },
      dueDate: new Date('2026-04-15'),
      status: 'pending'
    },
    {
      billId: 'BILL-00000003',
      customerId: 'CUST-004',
      customerName: 'Sunita Verma',
      billingPeriod: { from: new Date('2026-03-01'), to: new Date('2026-03-31') },
      usage: { previousReading: 2100, currentReading: 2290, unitsConsumed: 190 },
      charges: { basicCharge: 50, usageCharge: 950, taxes: 100, discount: 25, totalAmount: 1075 },
      dueDate: new Date('2026-04-12'),
      status: 'overdue'
    },
    {
      billId: 'BILL-00000004',
      customerId: 'CUST-001',
      customerName: 'Rajesh Kumar',
      billingPeriod: { from: new Date('2026-04-01'), to: new Date('2026-04-30') },
      usage: { previousReading: 1385, currentReading: 1560, unitsConsumed: 175 },
      charges: { basicCharge: 50, usageCharge: 875, taxes: 92.5, discount: 0, totalAmount: 1017.5 },
      dueDate: new Date('2026-05-15'),
      status: 'pending'
    },
    {
      billId: 'BILL-00000005',
      customerId: 'CUST-006',
      customerName: 'Customer User',
      billingPeriod: { from: new Date('2026-03-01'), to: new Date('2026-03-31') },
      usage: { previousReading: 980, currentReading: 1110, unitsConsumed: 130 },
      charges: { basicCharge: 50, usageCharge: 650, taxes: 70, discount: 0, totalAmount: 770 },
      dueDate: new Date('2026-04-25'),
      status: 'pending'
    }
  ]);

  await Payment.insertMany([
    {
      paymentId: 'PAY-00000001',
      billId: bills[0]._id.toString(),
      customerId: 'CUST-001',
      amount: 1072.5,
      method: 'credit_card',
      status: 'success',
      transactionId: 'TXN-ABC123',
      paidAt: new Date('2026-04-08T10:30:00Z')
    },
    {
      paymentId: 'PAY-00000002',
      billId: bills[1]._id.toString(),
      customerId: 'CUST-002',
      amount: 1500,
      method: 'net_banking',
      status: 'success',
      transactionId: 'TXN-DEF456',
      paidAt: new Date('2026-04-10T14:20:00Z')
    }
  ]);

  const summary = {
    users: await User.countDocuments(),
    customers: await Customer.countDocuments(),
    bills: await Bill.countDocuments(),
    payments: await Payment.countDocuments()
  };

  console.log('Seed complete:', summary);
  console.log('Test logins:');
  console.log('admin@ubcms.com / password');
  console.log('staff@ubcms.com / password');
  console.log('customer@ubcms.com / password');

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
