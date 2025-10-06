import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { Kid } from 'src/app/models/kid';
import { Statement } from 'src/app/models/statement';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { StatementService } from 'src/app/services/statement.service';

@Component({
  selector: 'app-kid-details-dialog',
  templateUrl: './kid-details-dialog.component.html',
  styleUrls: ['./kid-details-dialog.component.css']
})
export class KidDetailsDialogComponent {

  kid: Kid;
  statement: Statement | null = null;
  feeSchedules: FeeSchedule[] = [];
  statementPeriodStart: string = '';
  statementPeriodEnd: string = '';
  includeDetails: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { kid: Kid },
    private dialogRef: MatDialogRef<KidDetailsDialogComponent>,
    private statementService: StatementService,
    private feeScheduleService: FeeScheduleService
  ) {
    this.kid = data.kid;
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
