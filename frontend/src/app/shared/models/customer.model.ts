export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export type AccountType = 'residential' | 'commercial';
export type CustomerStatus = 'active' | 'inactive' | 'suspended';
export type TariffPlan = 'standard' | 'premium' | 'commercial';
export type DeliveryMethod = 'email' | 'postal';

export interface Customer {
  _id?: string;
  customerId?: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  accountType: AccountType;
  status: CustomerStatus;
  meterNumber?: string;
  tariffPlan: TariffPlan;
  preferredDeliveryMethod?: DeliveryMethod;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFilter {
  search?: string;
  status?: CustomerStatus | '';
  accountType?: AccountType | '';
}
