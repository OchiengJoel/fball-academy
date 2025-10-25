import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { FeeInvoicesComponent } from './components/fee-invoices/fee-invoices/fee-invoices.component';
import { FeeSchedulesComponent } from './components/fee-schedules/fee-schedules/fee-schedules.component';
import { KidsComponent } from './components/kids/kids/kids.component';
import { LoginComponent } from './components/login/login/login.component';
import { NotificationsComponent } from './components/notifications/notifications/notifications.component';
import { PaymentsComponent } from './components/payments/payments/payments.component';
import { ProgressComponent } from './components/progress/progress/progress.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password/reset-password.component';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { UsersComponent } from './components/users/users/users.component';
import { AuthGuard } from './guards/auth.guard';
import { ItemTypeManagementComponent } from './components/item-type-management/item-type-management.component';

const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'kids', component: KidsComponent, canActivate: [AuthGuard] },
  { path: 'fee-invoices', component: FeeInvoicesComponent, canActivate: [AuthGuard] },
  { path: 'item-types', component:ItemTypeManagementComponent, canActivate: [AuthGuard] },
  { path: 'payments', component: PaymentsComponent, canActivate: [AuthGuard] },
  { path: 'progress', component: ProgressComponent, canActivate: [AuthGuard] },
  { path: 'statements', component: StatementsComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'fee-schedules', component: FeeSchedulesComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
