import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';

const routes: Routes = [{ path: '', component: CustomerListComponent }];

@NgModule({
  declarations: [CustomerListComponent, CustomerFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class CustomersModule {}
