import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-wrap">
      <div class="spinner"></div>
      <span>{{ message }}</span>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
}
