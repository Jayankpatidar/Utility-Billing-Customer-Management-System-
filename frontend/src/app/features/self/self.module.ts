import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { CustomerService } from '@core/services/customer.service';
import { BillingService } from '@core/services/billing.service';
import { PaymentService } from '@core/services/payment.service';
import { ToastService } from '@core/services/toast.service';
import { Bill } from '@shared/models/bill.model';
import { PaymentMethod } from '@shared/models/payment.model';

declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  selector: 'app-self-account',
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Account</h1>
        <p>View and update your profile information</p>
      </div>
    </div>

    <div class="card" style="max-width:820px">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label>Name *</label>
            <input class="form-control" formControlName="name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="form-control" formControlName="email" readonly />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input class="form-control" formControlName="phone" />
          </div>
          <div class="form-group">
            <label>Preferred Bill Delivery</label>
            <select class="form-control" formControlName="preferredDeliveryMethod">
              <option value="email">Email</option>
              <option value="postal">Postal</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Street</label>
            <input class="form-control" formControlName="street" />
          </div>
          <div class="form-group">
            <label>City</label>
            <input class="form-control" formControlName="city" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>State</label>
            <input class="form-control" formControlName="state" />
          </div>
          <div class="form-group">
            <label>Zip</label>
            <input class="form-control" formControlName="zip" />
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
          <button class="btn btn-primary" type="submit" [disabled]="loading || form.invalid">
            {{ loading ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class SelfAccountComponent implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private customers: CustomerService, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      preferredDeliveryMethod: ['email'],
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    });
  }

  ngOnInit() {
    this.customers.getMe().subscribe({
      next: c => this.form.patchValue({
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        preferredDeliveryMethod: c.preferredDeliveryMethod || 'email',
        street: c.address?.street || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        zip: c.address?.zip || ''
      }),
      error: () => this.toast.error('Unable to load profile')
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;

    const payload = {
      name: this.form.value.name,
      phone: this.form.value.phone,
      preferredDeliveryMethod: this.form.value.preferredDeliveryMethod,
      address: {
        street: this.form.value.street,
        city: this.form.value.city,
        state: this.form.value.state,
        zip: this.form.value.zip
      }
    };

    this.customers.updateMe(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Profile updated successfully');
      },
      error: e => {
        this.loading = false;
        this.toast.error(e?.error?.error || 'Profile update failed');
      }
    });
  }
}

@Component({
  selector: 'app-self-bills',
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Bills</h1>
        <p>Complete billing history for your account</p>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading"></app-loading-spinner>

    <div class="card" style="padding:0" *ngIf="!loading">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Period</th>
              <th>Units</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bills">
              <td><span class="mono accent-text">{{ b.billId }}</span></td>
              <td>{{ b.billingPeriod.from | date:'dd MMM y' }} - {{ b.billingPeriod.to | date:'dd MMM y' }}</td>
              <td><span class="mono">{{ b.usage.unitsConsumed }}</span></td>
              <td><strong>{{ b.charges.totalAmount | inr }}</strong></td>
              <td><app-badge [value]="b.status"></app-badge></td>
              <td>{{ b.dueDate | date:'dd MMM y' }}</td>
            </tr>
            <tr *ngIf="bills.length === 0">
              <td colspan="6">
                <app-empty-state icon="fa-file-invoice" title="No bills yet" message="Your bill history will appear here."></app-empty-state>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SelfBillsComponent implements OnInit {
  loading = true;
  bills: Bill[] = [];

  constructor(private billing: BillingService) {}

  ngOnInit() {
    this.billing.getAll().subscribe({
      next: bills => {
        this.bills = bills;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

@Component({
  selector: 'app-self-pay',
  template: `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Pay Bill</h1>
        <p>Pay your pending bills online</p>
      </div>
    </div>

    <app-loading-spinner *ngIf="loading"></app-loading-spinner>

    <div class="card" style="max-width:920px" *ngIf="!loading">
      <div class="form-row">
        <div class="form-group" style="flex:2">
          <label>Select Pending Bill</label>
          <select class="form-control" [(ngModel)]="selectedBillId" (ngModelChange)="syncAmount()">
            <option [ngValue]="null">Select bill...</option>
            <option *ngFor="let b of payableBills" [ngValue]="b._id">{{ b.billId }} - {{ b.charges.totalAmount | inr }} ({{ b.status }})</option>
          </select>
        </div>
        <div class="form-group" style="flex:1">
          <label>Amount (INR)</label>
          <input class="form-control" type="number" [(ngModel)]="amount" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex:1">
          <label>Method</label>
          <select class="form-control" [(ngModel)]="method">
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="net_banking">Net Banking</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="neft">NEFT</option>
            <option value="rtgs">RTGS</option>
          </select>
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end">
          <button class="btn btn-primary" (click)="pay()" [disabled]="paying || !selectedBill">
            {{ paying ? 'Processing...' : 'Pay Now' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class SelfPayComponent implements OnInit {
  loading = true;
  paying = false;
  bills: Bill[] = [];
  selectedBillId: string | null = null;
  amount = 0;
  method: PaymentMethod = 'credit_card';

  constructor(private billing: BillingService, private payments: PaymentService, private toast: ToastService) {}

  get selectedBill(): Bill | null {
    return this.bills.find(b => b._id === this.selectedBillId) || null;
  }

  get payableBills(): Bill[] {
    return this.bills.filter(b => b.status === 'pending' || b.status === 'overdue');
  }

  ngOnInit() {
    this.billing.getAll().subscribe({
      next: bills => {
        this.bills = bills;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Unable to load bills');
      }
    });
  }

  syncAmount() {
    if (!this.selectedBill) {
      this.amount = 0;
      return;
    }
    this.amount = this.selectedBill.charges.totalAmount;
  }

  pay() {
    if (!this.selectedBill) return;
    this.paying = true;

    if (this.method === 'upi') {
      this.payViaUpi();
      return;
    }

    this.payments.process({
      billId: this.selectedBill._id!,
      customerId: this.selectedBill.customerId,
      amount: this.amount,
      method: this.method
    }).subscribe({
      next: res => {
        this.paying = false;
        if (res.status === 'success' || res.status === 'pending') {
          this.toast.success(res.message || 'Payment request submitted');
          this.reloadBills();
        } else {
          this.toast.error(res.message || 'Payment failed');
        }
      },
      error: e => {
        this.paying = false;
        this.toast.error(e?.error?.error || 'Payment failed');
      }
    });
  }

  private payViaUpi() {
    if (!this.selectedBill) return;

    if (!window.Razorpay) {
      this.paying = false;
      this.toast.error('Razorpay SDK not loaded');
      return;
    }

    this.payments.createRazorpayOrder({
      billId: this.selectedBill._id!,
      customerId: this.selectedBill.customerId,
      amount: this.amount
    }).subscribe({
      next: order => {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'UBCMS',
          description: `Bill Payment ${this.selectedBill?.billId || ''}`,
          order_id: order.orderId,
          method: { upi: true, card: false, netbanking: false, wallet: false, paylater: false, emi: false },
          handler: (response: any) => {
            this.payments.verifyRazorpayPayment({
              billId: this.selectedBill!._id!,
              customerId: this.selectedBill!.customerId,
              amount: this.amount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }).subscribe({
              next: () => {
                this.paying = false;
                this.toast.success('UPI payment successful');
                this.reloadBills();
              },
              error: e => {
                this.paying = false;
                this.toast.error(e?.error?.error || 'UPI verification failed');
              }
            });
          },
          modal: {
            ondismiss: () => {
              this.paying = false;
            }
          }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      },
      error: e => {
        this.paying = false;
        this.toast.error(e?.error?.error || 'Could not initiate UPI payment');
      }
    });
  }

  private reloadBills() {
    this.billing.getAll().subscribe({ next: bills => (this.bills = bills) });
  }
}

const routes: Routes = [
  { path: '', redirectTo: 'account', pathMatch: 'full' },
  { path: 'account', component: SelfAccountComponent },
  { path: 'bills', component: SelfBillsComponent },
  { path: 'pay', component: SelfPayComponent }
];

@NgModule({
  declarations: [SelfAccountComponent, SelfBillsComponent, SelfPayComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class SelfModule {}
