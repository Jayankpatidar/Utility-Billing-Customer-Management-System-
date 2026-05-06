import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="top-bar">
      <span class="top-bar-title">{{ pageTitle }}</span>
      <div class="top-bar-spacer"></div>
      <span class="top-bar-time mono muted">{{ currentTime }}</span>
    </header>
  `,
  styles: [`
    .top-bar {
      height: var(--header-h);
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
      padding: 0 24px; gap: 16px;
      position: sticky; top: 0; z-index: 50;
    }
    .top-bar-title { font-size: 16px; font-weight: 700; }
    .top-bar-spacer { flex: 1; }
    .top-bar-time { font-size: 12px; }
  `]
})
export class TopbarComponent implements OnInit {
  pageTitle = 'Dashboard';
  currentTime = '';

  private routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/customers': 'Customers',
    '/billing':   'Billing',
    '/payments':  'Payments',
    '/self/account': 'My Account',
    '/self/bills': 'My Bills',
    '/self/pay': 'Pay Bill',
    '/self': 'Self Service',
    '/reports':   'Analytics',
    '/settings':  'Settings'
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const key = Object.keys(this.routeTitles).find(k => e.urlAfterRedirects.startsWith(k));
      this.pageTitle = key ? this.routeTitles[key] : 'UBCMS';
    });

    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }, 1000);
  }
}
