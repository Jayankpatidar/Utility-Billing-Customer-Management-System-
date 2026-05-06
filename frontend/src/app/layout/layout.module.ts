import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AuthGuard } from '@core/guards/auth.guard';

import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '',        redirectTo: 'customers', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('../features/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'customers',
        loadChildren: () => import('../features/customers/customers.module').then(m => m.CustomersModule),
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'staff'] }
      },
      {
        path: 'billing',
        loadChildren: () => import('../features/billing/billing.module').then(m => m.BillingModule),
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'staff'] }
      },
      {
        path: 'payments',
        loadChildren: () => import('../features/payments/payments.module').then(m => m.PaymentsModule),
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'staff'] }
      },
      {
        path: 'self',
        loadChildren: () => import('../features/self/self.module').then(m => m.SelfModule),
        canActivate: [AuthGuard],
        data: { roles: ['customer'] }
      },
      {
        path: 'reports',
        loadChildren: () => import('../features/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'settings',
        loadChildren: () => import('../features/settings/settings.module').then(m => m.SettingsModule),
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
      }
    ]
  }
];

@NgModule({
  declarations: [LayoutComponent, SidebarComponent, TopbarComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class LayoutModule {}
