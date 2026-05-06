import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card">
      <div class="stat-icon" [ngClass]="iconColor">
        <i class="fas" [ngClass]="icon"></i>
      </div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div class="stat-trend" *ngIf="trend">{{ trend }}</div>
    </div>
  `
})
export class StatCardComponent {
  @Input() icon      = 'fa-chart-bar';
  @Input() iconColor = 'green';
  @Input() value     = '–';
  @Input() label     = '';
  @Input() trend     = '';
}
