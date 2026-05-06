import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '@core/services/payment.service';
import { ToastService } from '@core/services/toast.service';
import { Bill } from '@shared/models/bill.model';

declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnChanges {
  @Input()  isOpen = false;
  @Input()  bill: Bill | null = null;
  @Output() paid      = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private svc: PaymentService, private toast: ToastService) {
    this.form = this.fb.group({
      amount:     ['', Validators.required],
      method:     ['credit_card'],
      cardNumber: [''],
      expiry:     [''],
      cvv:        ['']
    });
  }

  ngOnChanges() {
    if (this.bill) { this.form.patchValue({ amount: this.bill.charges?.totalAmount }); }
  }

  get showCardFields() { return ['credit_card','debit_card'].includes(this.form.value.method); }

  get isUpiMethod() { return this.form.value.method === 'upi'; }

  onSubmit() {
    if (!this.bill) return;

    if (this.isUpiMethod) {
      this.startUpiPayment();
      return;
    }

    this.loading = true;
    this.svc.process({
      billId:     this.bill._id!,
      customerId: this.bill.customerId,
      amount:     +this.form.value.amount,
      method:     this.form.value.method
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.status === 'success') { this.toast.success('Payment successful! 🎉'); this.paid.emit(); }
        else { this.toast.error('Payment failed. Please try again.'); }
      },
      error: e => { this.toast.error(e?.error?.error || 'Payment failed'); this.loading = false; }
    });
  }

  private startUpiPayment() {
    if (!this.bill) return;

    if (!window.Razorpay) {
      this.toast.error('Razorpay SDK not loaded. Refresh and try again.');
      return;
    }

    this.loading = true;
    const amount = +this.form.value.amount;

    this.svc.createRazorpayOrder({
      billId: this.bill._id!,
      customerId: this.bill.customerId,
      amount
    }).subscribe({
      next: order => {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'UBCMS',
          description: `Bill Payment ${this.bill?.billId || ''}`,
          order_id: order.orderId,
          method: {
            upi: true,
            card: false,
            netbanking: false,
            wallet: false,
            paylater: false,
            emi: false
          },
          handler: (response: any) => {
            this.svc.verifyRazorpayPayment({
              billId: this.bill!._id!,
              customerId: this.bill!.customerId,
              amount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }).subscribe({
              next: () => {
                this.loading = false;
                this.toast.success('UPI payment successful!');
                this.paid.emit();
              },
              error: e => {
                this.loading = false;
                this.toast.error(e?.error?.error || 'UPI verification failed');
              }
            });
          },
          modal: {
            ondismiss: () => {
              this.loading = false;
            }
          },
          theme: {
            color: '#2A5CAA'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      },
      error: e => {
        this.loading = false;
        this.toast.error(e?.error?.error || 'Could not initiate UPI payment');
      }
    });
  }

  cancel() { this.cancelled.emit(); }
}
