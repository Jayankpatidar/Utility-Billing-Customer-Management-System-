import { Component, OnInit } from '@angular/core';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { Customer } from '@shared/models/customer.model';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  loading = true;

  // modal state
  showForm     = false;
  showConfirm  = false;
  editCustomer: Customer | null = null;
  deleteTarget: Customer | null = null;

  // filters
  searchQuery  = '';
  statusFilter = '';
  typeFilter   = '';

  constructor(private svc: CustomerService, private toast: ToastService, private auth: AuthService) {}

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: data => { this.customers = data; this.applyFilters(); this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  applyFilters() {
    this.filtered = this.customers.filter(c => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.customerId || '').toLowerCase().includes(q);
      const matchStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchType   = !this.typeFilter   || c.accountType === this.typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }

  get isCustomer(): boolean { return this.auth.hasRole('customer'); }

  get canManageCustomers(): boolean { return !this.isCustomer; }

  openAdd() {
    if (!this.canManageCustomers) return;
    this.editCustomer = null;
    this.showForm = true;
  }

  openEdit(c: Customer) {
    if (!this.canManageCustomers) return;
    this.editCustomer = c;
    this.showForm = true;
  }

  confirmDelete(c: Customer) {
    if (!this.canManageCustomers) return;
    this.deleteTarget = c;
    this.showConfirm = true;
  }

  onDelete() {
    if (!this.deleteTarget?._id) return;
    this.svc.delete(this.deleteTarget._id).subscribe({
      next: () => { this.toast.success('Customer deleted'); this.showConfirm = false; this.loadCustomers(); },
      error: (e) => { this.toast.error(e?.error?.error || 'Delete failed'); this.showConfirm = false; }
    });
  }

  onSaved() { this.showForm = false; this.loadCustomers(); }
}
