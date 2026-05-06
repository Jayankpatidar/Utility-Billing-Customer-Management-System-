import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this._toasts.asObservable();
  private nextId = 1;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500): void {
    const toast: ToastMessage = { id: this.nextId++, message, type };
    this._toasts.next([...this._toasts.value, toast]);
    setTimeout(() => this.remove(toast.id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string)   { this.show(message, 'error'); }
  info(message: string)    { this.show(message, 'info'); }

  remove(id: number): void {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }
}
