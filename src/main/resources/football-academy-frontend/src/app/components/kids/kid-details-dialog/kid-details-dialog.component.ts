import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { Kid } from 'src/app/models/kid';
import { Statement } from 'src/app/models/statement';
import { User } from 'src/app/models/user';
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
  feeSchedules: FeeSchedule[] = [];
  statementPeriodStart: string = '';
  statementPeriodEnd: string = '';
  includeDetails: boolean = false;

  selectedFeeScheduleIds: number[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { kid: Kid },
    private dialogRef: MatDialogRef<KidDetailsDialogComponent>,
    private statementService: StatementService,
    private feeScheduleService: FeeScheduleService,
    private kidService: KidService,
    private userService: UserService
  ) {
    this.kid = data.kid;
  }

  // ngOnInit() {
  //   this.feeScheduleService.getAllFeeSchedules().subscribe({
  //     next: (schedules) => (this.feeSchedules = schedules),
  //     error: (err) => alert('Failed to load fee schedules: ' + (err.error || 'Unknown error'))
  //   });
  // }

 ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadFeeSchedules();
      },
      error: (err: HttpErrorResponse) => alert('Failed to load user: ' + (err.error || 'Unknown error'))
    });
  }

  updateFeeSchedules() {
    this.kidService.updateFeeSchedules(this.kid.kidId, this.selectedFeeScheduleIds).subscribe({
      next: (kid) => {
        this.kid = kid;
        this.loadFeeSchedules();
      },
      error: (err) => alert('Failed to update fee schedules: ' + (err.error || 'Unknown error'))
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

  loadFeeSchedules() {
    this.feeScheduleService.getActiveFeeSchedules(new Date().toISOString().split('T')[0]).subscribe({
      next: (schedules) => (this.feeSchedules = schedules),
      error: (err) => alert('Failed to load fee schedules: ' + (err.error || 'Unknown error'))
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

  exportFeeSchedules(format: 'pdf' | 'excel') {
    this.feeScheduleService.exportFeeSchedules(this.kid.kidId, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fee_schedules_${this.kid.kidId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to export fee schedules: ' + (err.error || 'Unknown error'))
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
