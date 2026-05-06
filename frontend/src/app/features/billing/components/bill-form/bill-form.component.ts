import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingService } from '@core/services/billing.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss']
})
export class BillFormComponent implements OnChanges {
  @Input()  isOpen = false;
  @Output() generated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  loading  = false;
  preview: { units: number; basic: number; rate: number; usage: number; tax: number; discount: number; total: number } | null = null;

  constructor(private fb: FormBuilder, private svc: BillingService, private toast: ToastService) {
    const today     = new Date().toISOString().split('T')[0];
    const firstDay  = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    this.form = this.fb.group({
      customerId:      ['', Validators.required],
      customerName:    ['', Validators.required],
      tariffPlan:      ['standard', Validators.required],
      discount:        [0, [Validators.min(0)]],
      deliveryMethod:  ['email', Validators.required],
      billingFrom:     [firstDay, Validators.required],
      billingTo:       [today,    Validators.required],
      previousReading: [0,        [Validators.required, Validators.min(0)]],
      currentReading:  ['',       [Validators.required, Validators.min(0)]]
    });
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.form.reset({ previousReading: 0, tariffPlan: 'standard', discount: 0, deliveryMethod: 'email' });
      this.preview = null;
    }
  }

  calcPreview() {
    const prev = +this.form.value.previousReading || 0;
    const curr = +this.form.value.currentReading  || 0;
    const plan = this.form.value.tariffPlan || 'standard';
    const discount = +this.form.value.discount || 0;
    if (curr > prev) {
      const units = curr - prev;
      const c = this.svc.calculateCharges(units, plan, discount);
      this.preview = { units, ...c };
    } else {
      this.preview = null;
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.svc.generate(this.form.value).subscribe({
      next: () => { this.toast.success('Bill generated successfully!'); this.loading = false; this.generated.emit(); },
      error: e  => { this.toast.error(e?.error?.error || 'Generation failed'); this.loading = false; }
    });
  }

  cancel() { this.cancelled.emit(); }
}
