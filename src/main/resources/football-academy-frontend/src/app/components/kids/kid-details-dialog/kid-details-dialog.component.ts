import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BillingSchedule } from 'src/app/models/billing-schedule';
import { Kid } from 'src/app/models/kid';
import { Statement } from 'src/app/models/statement';
import { User } from 'src/app/models/user';
import { BillingScheduleService } from 'src/app/services/billing-schedule.service';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { KidService } from 'src/app/services/kid.service';
import { StatementService } from 'src/app/services/statement.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-kid-details-dialog',
  templateUrl: './kid-details-dialog.component.html',
  styleUrls: ['./kid-details-dialog.component.css']
})
export class KidDetailsDialogComponent implements OnInit {

  user: User | null = null;
  kid: Kid;
  statement: Statement | null = null;
  billingSchedules: BillingSchedule[] = [];
  statementPeriodStart: string = '';
  statementPeriodEnd: string = '';
  includeDetails: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { kid: Kid },
    private dialogRef: MatDialogRef<KidDetailsDialogComponent>,
    private statementService: StatementService,
    private billingScheduleService: BillingScheduleService,
    private kidService: KidService,
    private userService: UserService
  ) {
    this.kid = data.kid;
  }

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadBillingSchedules();
      },
      error: (err) => alert('Failed to load user: ' + (err.error || 'Unknown error'))
    });
  }

  loadStatement() {
    if (this.statementPeriodStart && this.statementPeriodEnd) {
      this.statementService
        .generateStatement(this.kid.kidId, this.statementPeriodStart, this.statementPeriodEnd, this.includeDetails)
        .subscribe({
          next: (statement) => (this.statement = statement),
          error: (err) => alert('Failed to load statement: ' + (err.error || 'Unknown error'))
        });
    }
  }

  loadBillingSchedules() {
    this.billingScheduleService.getBillingSchedulesForKid(this.kid.kidId).subscribe({
      next: (schedules) => (this.billingSchedules = schedules),
      error: (err) => alert('Failed to load billing schedules: ' + (err.error || 'Unknown error'))
    });
  }

  exportStatement(format: 'pdf' | 'excel') {
    if (this.statement) {
      this.statementService
        .exportStatement(this.kid.kidId, this.statementPeriodStart, this.statementPeriodEnd, this.includeDetails, format)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statement_${this.kid.kidId}.${format}`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => alert('Failed to export statement: ' + (err.error || 'Unknown error'))
        });
    }
  }

  exportBillingSchedules(format: 'pdf' | 'excel') {
    this.billingScheduleService.exportBillingSchedules(this.kid.kidId, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing_schedules_${this.kid.kidId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to export billing schedules: ' + (err.error || 'Unknown error'))
    });
  }

  exportProfileSummary(format: 'pdf' | 'excel') {
    this.statementService.exportProfileSummary(this.kid.kidId, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile_summary_${this.kid.kidId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to export profile summary: ' + (err.error || 'Unknown error'))
    });
  }

  close() {
    this.dialogRef.close();
  }

}