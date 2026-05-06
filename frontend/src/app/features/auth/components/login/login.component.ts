import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ValidatorsService } from '@core/services/validators.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error   = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private customValidators: ValidatorsService) {
    this.form = this.fb.group({
      email:    ['admin@ubcms.com', [Validators.required, this.customValidators.email()]],
      password: ['password',        [Validators.required, Validators.minLength(6)]]
    });
  }

  get emailCtrl()    { return this.form.get('email')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate([this.auth.getDefaultRoute()]),
      error: err => {
        this.error = err?.error?.error || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}
