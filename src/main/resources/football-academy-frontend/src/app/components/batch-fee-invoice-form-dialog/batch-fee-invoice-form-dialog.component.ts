import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Kid } from 'src/app/models/kid';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';

@Component({
  selector: 'app-batch-fee-invoice-form-dialog',
  templateUrl: './batch-fee-invoice-form-dialog.component.html',
  styleUrls: ['./batch-fee-invoice-form-dialog.component.css']
})
export class BatchFeeInvoiceFormDialogComponent implements OnInit {

  batchForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { kids: Kid[] },
    private dialogRef: MatDialogRef<BatchFeeInvoiceFormDialogComponent>,
    private fb: FormBuilder,
    private feeInvoiceService: FeeInvoiceService,
    private toastr: ToastrService
  ) {
    this.batchForm = this.fb.group({
      kidIds: [[]],
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required, this.endDateValidator()]],
      dueDate: ['', [Validators.required, this.futureDateValidator()]]
    });
  }

  ngOnInit() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    this.batchForm.patchValue({
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      dueDate: today.toISOString().split('T')[0]
    });
  }

  private futureDateValidator() {
    return (control: any) => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today ? null : { pastDate: true };
    };
  }

  private endDateValidator() {
    return (control: any) => {
      const endDate = new Date(control.value);
      const startDate = new Date(this.batchForm?.get('startDate')?.value);
      return endDate >= startDate ? null : { invalidEndDate: true };
    };
  }

  generateBatchInvoices() {
    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      this.toastr.warning('Please fill out all required fields correctly.', 'Warning');
      return;
    }
    this.loading = true;
    this.error = null;
    this.feeInvoiceService.generateBatchInvoices(this.batchForm.value).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.error = 'Failed to generate batch invoices: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

}
