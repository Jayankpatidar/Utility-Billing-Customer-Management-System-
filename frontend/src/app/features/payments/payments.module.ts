import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { Component, OnInit } from '@angular/core';
import { PaymentService } from '@core/services/payment.service';
import { Payment } from '@shared/models/payment.model';

@Component({
  selector: 'app-payments',
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Payments</h1>
        <p>All payment transactions</p>
      </div>
    </div>
    <app-loading-spinner *ngIf="loading"></app-loading-spinner>
    <div class="card" style="padding:0" *ngIf="!loading">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Payment ID</th><th>Bill ID</th><th>Customer</th>
              <th>Amount</th><th>Method</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments">
              <td><span class="mono accent-text">{{ p.paymentId }}</span></td>
              <td><span class="mono text-sm">{{ p.billId }}</span></td>
              <td>{{ p.customerId }}</td>
              <td><strong>{{ p.amount | inr }}</strong></td>
              <td>{{ p.method | titlecase }}</td>
              <td><app-badge [value]="p.status"></app-badge></td>
              <td class="text-sm muted mono">{{ p.paidAt | date:'dd MMM yyyy, hh:mm a' }}</td>
            </tr>
            <tr *ngIf="payments.length === 0">
              <td colspan="7">
                <app-empty-state icon="fa-credit-card" title="No payments yet" message="Payments will appear here once bills are paid."></app-empty-state>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  loading = true;
  constructor(private svc: PaymentService) {}
  ngOnInit() {
    this.svc.getAll().subscribe({ next: d => { this.payments = d; this.loading = false; }, error: () => { this.loading = false; } });
  }
}

const routes: Routes = [{ path: '', component: PaymentsComponent }];

@NgModule({
  declarations: [PaymentsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class PaymentsModule {}
