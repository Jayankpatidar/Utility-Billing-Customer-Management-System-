# UBCMS Backend

Node.js + Express API for Utility Billing and Customer Management System (UBCMS).

## Project Layout

The repository is now organized with only two top-level folders:

```text
ubcms/
|-- backend/
`-- frontend/
```

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB Atlas + Mongoose
- Auth: JWT with role-based access control (admin, staff, customer)
- Payments: Razorpay (UPI), Stripe (card/debit), offline methods (bank_transfer, neft, rtgs)

## Backend Setup

From the `backend` folder:

```bash
npm install
```

Create and configure `.env` (use `.env.example` as reference).

Required environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
NODE_ENV=development
```

Optional SMTP variables for bill email delivery:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_app_password
SMTP_FROM=UBCMS Billing <no-reply@ubcms.local>
```

## Run Backend

```bash
# development (nodemon)
npm run dev

# production style
npm start
```

Backend runs at: `http://localhost:5000`

## Run Full Project (2 terminals)

Because root scripts were removed during cleanup, run services separately:

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm start
```

Frontend runs at: `http://localhost:4200`

## Main API Routes

- `POST /api/auth/login`
- `POST /api/auth/register` (admin-only)
- `GET /api/customers`
- `GET /api/customers/me`
- `PUT /api/customers/me`
- `POST /api/billing/generate`
- `GET /api/billing`
- `POST /api/payments/process`
- `POST /api/payments/razorpay/order`
- `POST /api/payments/razorpay/verify`

## Epic Status Snapshot

- Epic 1 Account Management: mostly complete; add strict backend check to block bill generation for inactive/suspended accounts if required.
- Epic 2 Billing Generation: complete for generation/calculation; email delivery depends on SMTP config; postal is queue simulation.
- Epic 3 Payment Processing: methods implemented including bank_transfer/neft/rtgs; Stripe live success requires a real key.
- Epic 4 Self-Service Portal: backend support complete (`/customers/me`, customer-scoped bill/payment access).

## Notes

- If port `5000` is busy, stop the existing process before running backend.
- If Stripe key is placeholder, card/debit processing will return a configured failure message by design.
