import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  template: `
    <div class="page-header">
      <div class="page-header-left"><h1>Settings</h1><p>System configuration and preferences</p></div>
    </div>

    <div class="settings-grid">
      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">System Information</div></div>
          <div class="detail-row"><span class="detail-label">Project</span>    <span class="detail-value">UBCMS v1.0.0</span></div>
          <div class="detail-row"><span class="detail-label">Frontend</span>   <span class="detail-value">Angular 17</span></div>
          <div class="detail-row"><span class="detail-label">Backend</span>    <span class="detail-value">Node.js + Express</span></div>
          <div class="detail-row"><span class="detail-label">Database</span>   <span class="detail-value">MongoDB + Mongoose</span></div>
          <div class="detail-row"><span class="detail-label">Payment</span>    <span class="detail-value">Stripe API</span></div>
          <div class="detail-row"><span class="detail-label">API Base URL</span><span class="detail-value mono">{{ apiUrl }}</span></div>
          <div class="detail-row"><span class="detail-label">Environment</span><span class="detail-value"><app-badge [value]="env"></app-badge></span></div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Tariff Configuration</div></div>
          <div class="detail-row"><span class="detail-label">Standard Rate</span> <span class="detail-value mono">₹5.00 / unit</span></div>
          <div class="detail-row"><span class="detail-label">Basic Charge</span>  <span class="detail-value mono">₹50.00 / month</span></div>
          <div class="detail-row"><span class="detail-label">Tax Rate</span>      <span class="detail-value mono">10%</span></div>
          <div class="detail-row"><span class="detail-label">Late Fee</span>      <span class="detail-value mono">₹25.00</span></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">API Connection Test</div></div>
        <div class="form-group">
          <label>Backend API URL</label>
          <input type="text" [(ngModel)]="apiUrl" class="form-control" />
          <div class="form-hint">Current: {{ apiUrl }}</div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <button class="btn btn-primary" (click)="testConnection()">
            <i class="fas fa-plug"></i> Test Connection
          </button>
        </div>
        <div *ngIf="connStatus" class="conn-status" [class.ok]="connOk" [class.fail]="!connOk">
          <i class="fas" [ngClass]="connOk ? 'fa-check-circle' : 'fa-times-circle'"></i>
          {{ connStatus }}
        </div>

        <div class="card-header" style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border)">
          <div class="card-title">Project Team</div>
        </div>
        <div class="detail-row"><span class="detail-label">Role</span>             <span class="detail-value">Responsibility</span></div>
        <div class="detail-row"><span class="detail-label">Project Manager</span>  <span class="detail-value">Planning & coordination</span></div>
        <div class="detail-row"><span class="detail-label">Backend Dev</span>      <span class="detail-value">Node.js, MongoDB APIs</span></div>
        <div class="detail-row"><span class="detail-label">Frontend Dev</span>     <span class="detail-value">Angular UI/UX</span></div>
        <div class="detail-row"><span class="detail-label">QA Engineer</span>      <span class="detail-value">Testing & quality</span></div>
        <div class="detail-row"><span class="detail-label">UX Designer</span>      <span class="detail-value">Design system</span></div>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    @media(max-width:768px){.settings-grid{grid-template-columns:1fr;}}
    .conn-status { padding:10px 14px; border-radius:6px; font-size:13px; font-family:var(--font-mono); display:flex; align-items:center; gap:8px; }
    .conn-status.ok   { background:var(--accent-dim); color:var(--accent); }
    .conn-status.fail { background:var(--warn-dim);   color:var(--warn); }
  `]
})
export class SettingsComponent implements OnInit {
  apiUrl     = environment.apiUrl;
  env        = environment.production ? 'production' : 'development';
  connStatus = '';
  connOk     = false;

  constructor(private http: HttpClient) {}
  ngOnInit() {}

  testConnection() {
    this.connStatus = 'Testing...'; this.connOk = false;
    const base = this.apiUrl.replace(/\/api$/, '');
    this.http.get<{message: string}>(`${base}/api/health`).subscribe({
      next: r  => { this.connOk = true;  this.connStatus = '✅ ' + r.message; },
      error: () => { this.connOk = false; this.connStatus = '❌ Connection failed – Is the backend running?'; }
    });
  }
}

const routes: Routes = [{ path: '', component: SettingsComponent }];

@NgModule({
  declarations: [SettingsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class SettingsModule {}
