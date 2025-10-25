import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingSchedule } from 'src/app/models/billing-schedule';
import { BillingScheduleService } from 'src/app/services/billing-schedule.service';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Kid } from 'src/app/models/kid';
import { ItemTypeService } from 'src/app/services/item-type.service';
import { ManualInvoiceRequest } from 'src/app/models/manual-invoice-request';
import { ItemType } from 'src/app/models/item-type';

@Component({
  selector: 'app-fee-invoice-form-dialog',
  templateUrl: './fee-invoice-form-dialog.component.html',
  styleUrls: ['./fee-invoice-form-dialog.component.css']
})
export class FeeInvoiceFormDialogComponent implements OnInit {

  invoiceForm: FormGroup;
  billingSchedules: BillingSchedule[] = [];
  itemTypes: ItemType[] = [];
  items: FormArray;
  loading: boolean = false;
  error: string | null = null;
  subtotal: number = 0;
  total: number = 0;
  isManualInvoice: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { kids: Kid[] },
    private dialogRef: MatDialogRef<FeeInvoiceFormDialogComponent>,
    private fb: FormBuilder,
    private feeInvoiceService: FeeInvoiceService,
    private billingScheduleService: BillingScheduleService,
    private itemTypeService: ItemTypeService,
    private toastr: ToastrService
  ) {
    this.items = this.fb.array([]);
    this.invoiceForm = this.fb.group({
      kidId: [''],
      clientName: [''],
      dueDate: ['', [Validators.required, this.futureDateValidator()]],
      isManualInvoice: [false],
      items: this.items
    });
  }

  ngOnInit() {
    this.loading = true;
    this.itemTypeService.getAllItemTypes().subscribe({
      next: (itemTypes) => {
        this.itemTypes = itemTypes;
        this.billingScheduleService.getActiveBillingSchedules(new Date().toISOString().split('T')[0]).subscribe({
          next: (schedules) => {
            this.billingSchedules = schedules;
            this.loading = false;
            this.addItem();
          },
          error: (err) => {
            this.error = 'Failed to load billing schedules: ' + (err.error?.message || 'Unknown error');
            this.toastr.error(this.error, 'Error');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load item types: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });

    this.invoiceForm.get('isManualInvoice')?.valueChanges.subscribe(value => {
      this.isManualInvoice = value;
      if (value) {
        this.invoiceForm.get('kidId')?.clearValidators();
        this.invoiceForm.get('clientName')?.setValidators([Validators.required]);
      } else {
        this.invoiceForm.get('kidId')?.setValidators([Validators.required, Validators.min(1)]);
        this.invoiceForm.get('clientName')?.clearValidators();
      }
      this.invoiceForm.get('kidId')?.updateValueAndValidity();
      this.invoiceForm.get('clientName')?.updateValueAndValidity();
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

  get itemsControls() {
        return this.items.controls as FormGroup[];
    }

    addItem() {
        const itemForm = this.fb.group({
            billingScheduleId: [this.isManualInvoice ? null : '', this.isManualInvoice ? [] : [Validators.required, Validators.min(1)]],
            itemTypeId: ['', [Validators.required, Validators.min(1)]],
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitCost: [0, [Validators.required, Validators.min(0)]],
            vatAmount: [0, Validators.min(0)]
        });
        this.items.push(itemForm);
        this.updateTotals();
    }

    removeItem(index: number) {
        if (this.items.length > 1) {
            this.items.removeAt(index);
            this.updateTotals();
        } else {
            this.toastr.warning('At least one item is required.', 'Warning');
        }
    }

  updateTotals() {
        this.subtotal = this.items.controls.reduce((sum, control) => {
            const quantity = control.get('quantity')?.value || 0;
            const unitCost = control.get('unitCost')?.value || 0;
            return sum + (quantity * unitCost);
        }, 0);
        this.total = this.items.controls.reduce((sum, control) => {
            const quantity = control.get('quantity')?.value || 0;
            const unitCost = control.get('unitCost')?.value || 0;
            const vatAmount = control.get('vatAmount')?.value || 0;
            return sum + (quantity * unitCost + vatAmount);
        }, 0);
    }

    createInvoice() {
        if (this.invoiceForm.invalid) {
            this.invoiceForm.markAllAsTouched();
            this.toastr.warning('Please fill out all required fields correctly.', 'Warning');
            return;
        }
        this.loading = true;
        this.error = null;
        const formValue = this.invoiceForm.value;
        if (formValue.isManualInvoice) {
            const request: ManualInvoiceRequest = {
                kidId: formValue.kidId || undefined,
                clientName: formValue.clientName || undefined,
                dueDate: formValue.dueDate,
                items: formValue.items
            };
            this.feeInvoiceService.createManualInvoice(request).subscribe({
                next: () => {
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.error = 'Failed to create invoice: ' + (err.error?.message || 'Unknown error');
                    this.toastr.error(this.error, 'Error');
                    this.loading = false;
                }
            });
        } else {
            const request = {
                kidId: formValue.kidId,
                dueDate: formValue.dueDate,
                items: formValue.items
            };
            this.feeInvoiceService.createInvoice(request).subscribe({
                next: () => {
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.error = 'Failed to create invoice: ' + (err.error?.message || 'Unknown error');
                    this.toastr.error(this.error, 'Error');
                    this.loading = false;
                }
            });
        }
    }

    close() {
        this.dialogRef.close();
    }

}
