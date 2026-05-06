import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `<span class="badge" [ngClass]="'badge-' + value">{{ value }}</span>`
})
export class BadgeComponent {
  @Input() value = '';
}
