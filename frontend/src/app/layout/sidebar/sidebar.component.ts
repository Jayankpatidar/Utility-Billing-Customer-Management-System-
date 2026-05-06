import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@shared/models/auth.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  template: `
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="sidebar-icon"><i class="fas fa-bolt"></i></div>
          <div>
            <div class="sidebar-title">UBCMS</div>
            <div class="sidebar-sub">v1.0.0</div>
          </div>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        <a *ngFor="let item of mainNav"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item">
          <i class="fas" [ngClass]="item.icon"></i>
          {{ item.label }}
          <span class="nav-badge" *ngIf="item.badge">{{ item.badge }}</span>
        </a>

        <div class="nav-section-label" style="margin-top:8px">Reports</div>
        <a *ngFor="let item of reportsNav"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item">
          <i class="fas" [ngClass]="item.icon"></i>
          {{ item.label }}
        </a>

        <div class="nav-section-label" style="margin-top:8px">System</div>
        <a *ngFor="let item of systemNav"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item">
          <i class="fas" [ngClass]="item.icon"></i>
          {{ item.label }}
        </a>
      </div>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div>
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
          <button class="logout-btn" (click)="logout()" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private mainNavAll: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fa-tachometer-alt', roles: ['admin'] },
    { label: 'Customers', route: '/customers', icon: 'fa-users', roles: ['admin', 'staff'] },
    { label: 'Billing',   route: '/billing',   icon: 'fa-file-invoice', roles: ['admin', 'staff'] },
    { label: 'Payments',  route: '/payments',  icon: 'fa-credit-card', roles: ['admin', 'staff'] },
    { label: 'Self Service', route: '/self', icon: 'fa-user-circle', roles: ['customer'] }
  ];

  private reportsNavAll: NavItem[] = [
    { label: 'Analytics', route: '/reports', icon: 'fa-chart-line', roles: ['admin'] }
  ];

  private systemNavAll: NavItem[] = [
    { label: 'Settings', route: '/settings', icon: 'fa-cog', roles: ['admin'] }
  ];

  get mainNav(): NavItem[] { return this.filterByRole(this.mainNavAll); }
  get reportsNav(): NavItem[] { return this.filterByRole(this.reportsNavAll); }
  get systemNav(): NavItem[] { return this.filterByRole(this.systemNavAll); }

  get userName()    { return this.auth.currentUser?.name || 'User'; }
  get userRole()    { return this.auth.currentUser?.role || 'staff'; }
  get userInitial() { return this.userName[0].toUpperCase(); }

  constructor(private auth: AuthService, private router: Router) {}

  private filterByRole(items: NavItem[]): NavItem[] {
    const role = (this.auth.currentUser?.role || 'staff') as UserRole;
    return items.filter(i => i.roles.includes(role));
  }

  logout() { this.auth.logout(); }
}
