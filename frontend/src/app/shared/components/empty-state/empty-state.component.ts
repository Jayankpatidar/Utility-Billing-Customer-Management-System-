import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <i class="fas" [ngClass]="icon"></i>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon  = 'fa-inbox';
  @Input() title = 'No data found';
  @Input() message = 'Nothing to display here yet.';
}
