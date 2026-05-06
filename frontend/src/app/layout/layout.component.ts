import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <div class="app-shell">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-topbar></app-topbar>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
    <app-toast></app-toast>
  `
})
export class LayoutComponent {}
