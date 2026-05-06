import { Component, OnInit } from '@angular/core';
import { BillingService } from '@core/services/billing.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { Bill } from '@shared/models/bill.model';

@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html'
})
export class BillListComponent implements OnInit {
  bills: Bill[] = [];
  filtered: Bill[] = [];
  loading = true;

  showGenerate   = false;
  showPayment    = false;
  showDetail     = false;
  selectedBill: Bill | null = null;

  searchQuery  = '';
  statusFilter = '';

  constructor(private svc: BillingService, private toast: ToastService, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: d => { this.bills = d; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    this.filtered = this.bills.filter(b => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !q || (b.billId || '').toLowerCase().includes(q) || (b.customerName || '').toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || b.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  openDetail(b: Bill)  { this.selectedBill = b; this.showDetail  = true; }
  openPayment(b: Bill) {
    if (!this.canPerformPayments) return;
    this.selectedBill = b;
    this.showPayment = true;
  }

  onBillGenerated() { this.showGenerate = false; this.load(); }
  onPaymentDone()   { this.showPayment  = false; this.load(); }

  get isCustomer(): boolean { return this.auth.hasRole('customer'); }

  get canGenerateBill(): boolean { return !this.isCustomer; }

  get canPerformPayments(): boolean { return !this.isCustomer; }

  canPay(b: Bill) {
    return this.canPerformPayments && (b.status === 'pending' || b.status === 'overdue');
  }
}
