import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts" class="toast-msg" [ngClass]="t.type">
        <i class="fas" [ngClass]="{'fa-check-circle': t.type==='success','fa-exclamation-circle': t.type==='error','fa-info-circle': t.type==='info'}"></i>
        <span>{{ t.message }}</span>
        <button class="toast-close" (click)="remove(t.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container { position:fixed; bottom:24px; right:24px; z-index:2000; display:flex; flex-direction:column; gap:8px; }
    .toast-msg { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 16px; min-width:260px; box-shadow:var(--shadow); display:flex; align-items:center; gap:10px; font-size:13.5px; animation:toastIn .3s ease; }
    .toast-msg.success { border-color:var(--accent); }
    .toast-msg.success i { color:var(--accent); }
    .toast-msg.error { border-color:var(--warn); }
    .toast-msg.error i { color:var(--warn); }
    .toast-msg.info { border-color:var(--accent2); }
    .toast-msg.info i { color:var(--accent2); }
    .toast-close { margin-left:auto; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:16px; line-height:1; }
    @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  `]
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];
  constructor(private toastService: ToastService) {}
  ngOnInit() { this.toastService.toasts$.subscribe(t => this.toasts = t); }
  remove(id: number) { this.toastService.remove(id); }
}
