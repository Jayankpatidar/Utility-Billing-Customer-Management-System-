import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  template: `
    <div class="modal-backdrop" [class.open]="isOpen">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="modal-close" (click)="cancel()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:var(--text-muted)">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
          <button class="btn btn-danger" (click)="confirm()">
            <i class="fas fa-trash"></i> {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop { display:none; position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:600; align-items:center; justify-content:center; padding:20px; }
    .modal-backdrop.open { display:flex; }
    .modal { background:var(--bg-card); border:1px solid var(--border); border-radius:14px; width:100%; box-shadow:var(--shadow); animation:slideUp .25s ease; }
    .modal-header { padding:20px 24px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
    .modal-header h3 { font-size:17px; font-weight:700; }
    .modal-close { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:18px; }
    .modal-body { padding:20px 24px; }
    .modal-footer { padding:16px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; }
    @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen       = false;
  @Input() title        = 'Confirm Action';
  @Input() message      = 'Are you sure you want to proceed?';
  @Input() confirmLabel = 'Delete';
  @Output() confirmed   = new EventEmitter<void>();
  @Output() cancelled   = new EventEmitter<void>();

  confirm() { this.confirmed.emit(); }
  cancel()  { this.cancelled.emit(); }
}
