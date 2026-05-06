export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  pendingBills: number;
  overdueBills: number;
  totalRevenue: number;
  monthlyCollection?: MonthlyData[];
  recentActivity?: ActivityItem[];
}

export interface MonthlyData {
  month: string;
  amount: number;
}

export interface ActivityItem {
  type: 'payment' | 'bill' | 'customer';
  message: string;
  amount?: number;
  time: string;
}
