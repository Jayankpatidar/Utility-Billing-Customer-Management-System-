export type PaymentMethod = 'credit_card' | 'debit_card' | 'net_banking' | 'upi' | 'cash' | 'bank_transfer' | 'neft' | 'rtgs';
export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface Payment {
  _id?: string;
  paymentId?: string;
  billId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  stripePaymentId?: string;
  paidAt?: string;
  message?: string;
}

export interface ProcessPaymentRequest {
  billId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
}

export interface RazorpayOrderRequest {
  billId: string;
  customerId: string;
  amount: number;
}

export interface RazorpayOrderResponse {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  billId: string;
  customerId: string;
}

export interface RazorpayVerifyRequest {
  billId: string;
  customerId: string;
  amount: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
