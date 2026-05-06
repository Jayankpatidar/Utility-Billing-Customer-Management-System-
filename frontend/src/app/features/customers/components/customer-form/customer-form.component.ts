import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '@core/services/customer.service';
import { ToastService } from '@core/services/toast.service';
import { ValidatorsService } from '@core/services/validators.service';
import { Customer } from '@shared/models/customer.model';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnChanges {
  @Input() isOpen   = false;
  @Input() customer: Customer | null = null;
  @Output() saved     = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private svc: CustomerService, private toast: ToastService, private customValidators: ValidatorsService) {
    this.form = this.fb.group({
      name:        ['', [Validators.required]],
      email:       ['', [Validators.required, this.customValidators.email()]],
      phone:       ['', this.customValidators.mobileNumber()],
      meterNumber: ['', this.customValidators.meterNumber()],
      accountType: ['residential'],
      tariffPlan:  ['standard'],
      status:      ['active'],
      city:        [''],
      state:       ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customer'] || changes['isOpen']) {
      if (this.customer) {
        this.form.patchValue({
          ...this.customer,
          city:  this.customer.address?.city  || '',
          state: this.customer.address?.state || ''
        });
      } else {
        this.form.reset({ accountType: 'residential', tariffPlan: 'standard', status: 'active' });
      }
    }
  }

  get isEdit() { return !!this.customer; }
  get title()  { return this.isEdit ? 'Edit Customer' : 'Add Customer'; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    const { city, state, ...rest } = this.form.value;
    const payload: Partial<Customer> = { ...rest, address: { city, state } };

    const req = this.isEdit
      ? this.svc.update(this.customer!._id!, payload)
      : this.svc.create(payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Customer updated!' : 'Customer added!');
        this.loading = false;
        this.saved.emit();
      },
      error: e => {
        this.toast.error(e?.error?.error || 'Save failed');
        this.loading = false;
      }
    });
  }

  cancel() { this.cancelled.emit(); }
}
