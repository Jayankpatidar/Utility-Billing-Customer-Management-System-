const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const buildEmailBody = (bill) => {
  const from = new Date(bill.billingPeriod.from).toLocaleDateString('en-IN');
  const to = new Date(bill.billingPeriod.to).toLocaleDateString('en-IN');
  const dueDate = new Date(bill.dueDate).toLocaleDateString('en-IN');

  return {
    subject: `UBCMS Bill ${bill.billId} - Amount Due INR ${bill.charges.totalAmount}`,
    text: [
      `Hello ${bill.customerName || 'Customer'},`,
      '',
      `Your bill ${bill.billId} has been generated.`,
      `Billing period: ${from} to ${to}`,
      `Units consumed: ${bill.usage.unitsConsumed}`,
      `Tariff plan: ${bill.tariffPlan} (INR ${bill.ratePerUnit}/unit)`,
      `Total due: INR ${bill.charges.totalAmount}`,
      `Due date: ${dueDate}`,
      '',
      'Regards,',
      'UBCMS Billing Team'
    ].join('\n')
  };
};

const deliverBill = async ({ bill, customer }) => {
  const method = customer?.preferredDeliveryMethod || 'email';

  if (method === 'postal') {
    return {
      method,
      status: 'queued',
      sentAt: new Date(),
      error: 'Postal delivery queued for dispatch'
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      method: 'email',
      status: 'queued',
      sentAt: new Date(),
      error: 'SMTP not configured; email queued'
    };
  }

  if (!customer?.email) {
    return {
      method: 'email',
      status: 'failed',
      error: 'Customer email not found'
    };
  }

  const emailContent = buildEmailBody(bill);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: customer.email,
    subject: emailContent.subject,
    text: emailContent.text
  });

  return {
    method: 'email',
    status: 'sent',
    sentAt: new Date()
  };
};

module.exports = { deliverBill };
