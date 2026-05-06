import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  template: `
    <div class="page-header">
      <div class="page-header-left"><h1>Analytics</h1><p>System performance and Agile metrics</p></div>
    </div>

    <div class="stats-grid">
      <app-stat-card icon="fa-check-circle" iconColor="green"  value="97.4%" label="Billing Accuracy"   trend="↑ Above target"></app-stat-card>
      <app-stat-card icon="fa-clock"        iconColor="blue"   value="1.2s"   label="Avg Payment Time"  trend="↓ Improved"></app-stat-card>
      <app-stat-card icon="fa-smile"        iconColor="gold"   value="4.7/5"  label="Customer Rating"   trend="↑ Excellent"></app-stat-card>
      <app-stat-card icon="fa-server"       iconColor="orange" value="99.9%"  label="System Uptime"     trend="SLA compliant"></app-stat-card>
    </div>

    <div class="reports-grid">
      <div class="card">
        <div class="card-header"><div class="card-title">Billing Summary</div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Category</th><th>Count</th><th>Amount</th><th>Share</th></tr></thead>
            <tbody>
              <tr><td>Paid Bills</td>    <td class="mono">1</td><td>₹1,072.50</td><td><app-badge value="paid"></app-badge></td></tr>
              <tr><td>Pending Bills</td> <td class="mono">2</td><td>₹4,311.50</td><td><app-badge value="pending"></app-badge></td></tr>
              <tr><td>Overdue Bills</td> <td class="mono">1</td><td>₹1,075.00</td><td><app-badge value="overdue"></app-badge></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Agile Sprint Metrics</div></div>
        <div class="detail-row"><span class="detail-label">Sprint Velocity</span>     <span class="detail-value mono">42 pts/sprint</span></div>
        <div class="detail-row"><span class="detail-label">Story Clarity Index</span> <span class="detail-value mono">8.3 / 10</span></div>
        <div class="detail-row"><span class="detail-label">Defect Rate</span>         <span class="detail-value mono">2.6%</span></div>
        <div class="detail-row"><span class="detail-label">Test Coverage</span>       <span class="detail-value mono">84%</span></div>
        <div class="detail-row"><span class="detail-label">Active Sprint</span>       <span class="detail-value"><app-badge value="active"></app-badge> Sprint 6</span></div>
        <div class="detail-row"><span class="detail-label">Tech Stack</span>          <span class="detail-value">Angular · Node.js · MongoDB</span></div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Customer Distribution</div></div>
        <div class="detail-row"><span class="detail-label">Residential</span><span class="detail-value mono">3 accounts (60%)</span></div>
        <div class="detail-row"><span class="detail-label">Commercial</span>  <span class="detail-value mono">2 accounts (40%)</span></div>
        <div class="detail-row"><span class="detail-label">Active</span>      <span class="detail-value"><app-badge value="active"></app-badge></span></div>
        <div class="detail-row"><span class="detail-label">Inactive</span>    <span class="detail-value"><app-badge value="inactive"></app-badge></span></div>
        <div class="detail-row"><span class="detail-label">Suspended</span>   <span class="detail-value"><app-badge value="suspended"></app-badge></span></div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Tariff Plans</div></div>
        <div class="detail-row"><span class="detail-label">Standard</span>   <span class="detail-value mono">₹5/unit + ₹50 fixed</span></div>
        <div class="detail-row"><span class="detail-label">Premium</span>    <span class="detail-value mono">₹6/unit + ₹75 fixed</span></div>
        <div class="detail-row"><span class="detail-label">Commercial</span> <span class="detail-value mono">₹7/unit + ₹100 fixed</span></div>
        <div class="detail-row"><span class="detail-label">Tax</span>        <span class="detail-value mono">10% on all plans</span></div>
        <div class="detail-row"><span class="detail-label">Late Fee</span>   <span class="detail-value mono">₹25 after due date</span></div>
      </div>
    </div>
  `,
  styles: [`.reports-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;}`]
})
export class ReportsComponent {}

const routes: Routes = [{ path: '', component: ReportsComponent }];

@NgModule({
  declarations: [ReportsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ReportsModule {}
