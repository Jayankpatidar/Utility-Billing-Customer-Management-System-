import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Bill } from '@shared/models/bill.model';

@Component({
  selector: 'app-bill-detail',
  templateUrl: './bill-detail.component.html',
  styleUrls: ['./bill-detail.component.scss']
})
export class BillDetailComponent {
  @Input()  isOpen = false;
  @Input()  bill: Bill | null = null;
  @Output() closed = new EventEmitter<void>();
}
