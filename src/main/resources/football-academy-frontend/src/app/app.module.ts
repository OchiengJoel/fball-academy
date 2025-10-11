import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule} from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { KidsComponent } from './components/kids/kids/kids.component';
import { FeeInvoicesComponent } from './components/fee-invoices/fee-invoices/fee-invoices.component';
import { PaymentsComponent } from './components/payments/payments/payments.component';
import { ProgressComponent } from './components/progress/progress/progress.component';
import { StatementsComponent } from './components/statements/statements/statements.component';
import { NotificationsComponent } from './components/notifications/notifications/notifications.component';
import { FeeSchedulesComponent } from './components/fee-schedules/fee-schedules/fee-schedules.component';
import { UsersComponent } from './components/users/users/users.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { SidebarComponent } from './components/sidebar/sidebar/sidebar.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { KidDetailsDialogComponent } from './components/kids/kid-details-dialog/kid-details-dialog.component';
import { UserEditDialogComponent } from './components/users/user-edit-dialog/user-edit-dialog.component';
import { KidEditDialogComponent } from './components/kids/kid-edit-dialog/kid-edit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ResetPasswordComponent,
    DashboardComponent,
    KidsComponent,
    FeeInvoicesComponent,
    PaymentsComponent,
    ProgressComponent,
    StatementsComponent,
    NotificationsComponent,
    FeeSchedulesComponent,
    UsersComponent,
    SidebarComponent,
    KidDetailsDialogComponent,
    UserEditDialogComponent,
    KidEditDialogComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatSelectModule,
    BrowserAnimationsModule
    
    
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
