export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface BillingPeriod {
  from: string;
  to: string;
}

export interface Usage {
  previousReading: number;
  currentReading: number;
  unitsConsumed?: number;
}

export interface Charges {
  basicCharge: number;
  usageCharge: number;
  taxes: number;
  discount: number;
  totalAmount: number;
}

export interface BillDelivery {
  method: 'email' | 'postal';
  status: 'sent' | 'queued' | 'failed';
  sentAt?: string;
  error?: string;
}

export interface Bill {
  _id?: string;
  billId?: string;
  customerId: string;
  customerName?: string;
  tariffPlan?: 'standard' | 'premium' | 'commercial';
  ratePerUnit?: number;
  billingPeriod: BillingPeriod;
  usage: Usage;
  charges: Charges;
  delivery?: BillDelivery;
  dueDate?: string;
  status: BillStatus;
  paymentDate?: string;
  generatedAt?: string;
}

export interface GenerateBillRequest {
  customerId: string;
  customerName: string;
  previousReading: number;
  currentReading: number;
  billingFrom: string;
  billingTo: string;
  tariffPlan?: 'standard' | 'premium' | 'commercial';
  discount?: number;
  deliveryMethod?: 'email' | 'postal';
}

export interface BillFilter {
  search?: string;
  status?: BillStatus | '';
}
