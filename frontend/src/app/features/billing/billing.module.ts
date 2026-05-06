import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BillListComponent } from './components/bill-list/bill-list.component';
import { BillFormComponent } from './components/bill-form/bill-form.component';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';
import { BillDetailComponent } from './components/bill-detail/bill-detail.component';

const routes: Routes = [{ path: '', component: BillListComponent }];

@NgModule({
  declarations: [BillListComponent, BillFormComponent, PaymentModalComponent, BillDetailComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class BillingModule {}
