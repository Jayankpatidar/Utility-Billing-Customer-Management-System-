import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InrPipe } from './pipes/inr.pipe';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ToastComponent } from './components/toast/toast.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { BadgeComponent } from './components/badge/badge.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';

const SHARED_DECLARATIONS = [
  InrPipe,
  ConfirmModalComponent,
  ToastComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  BadgeComponent,
  StatCardComponent
];

@NgModule({
  declarations: SHARED_DECLARATIONS,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  exports: [...SHARED_DECLARATIONS, CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class SharedModule {}
