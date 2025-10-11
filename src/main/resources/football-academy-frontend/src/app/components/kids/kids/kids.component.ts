import { Component, Inject, OnInit } from '@angular/core';
import { Kid, KidBalance } from 'src/app/models/kid';
import { KidRequest } from 'src/app/models/kid-request';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';
import { KidDetailsDialogComponent } from '../kid-details-dialog/kid-details-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { KidEditDialogComponent } from '../kid-edit-dialog/kid-edit-dialog.component';
import { FeeInvoice } from 'src/app/models/fee-invoice';
import { BillingSchedule } from 'src/app/models/billing-schedule';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-kids',
  templateUrl: './kids.component.html',
  styleUrls: ['./kids.component.css']
})
export class KidsComponent implements OnInit {

  kids: Kid[] = [];
  addKidForm: FormGroup;
  searchForm: FormGroup;
  kidBalances: KidBalance[] = [];
  outstandingForm: FormGroup;
  user: User | null = null;
  feeSchedules: FeeSchedule[] = [];
  parents: User[] = [];
  recurrenceIntervals = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'];
  feeInvoices: FeeInvoice[] = [];
  billingSchedules: BillingSchedule[] = [];
  recentInvoices: FeeInvoice[] = []; // New property for recent invoices
  recentSchedules: BillingSchedule[] = []; // New property for recent schedules

  constructor(
    private kidService: KidService,
    private userService: UserService,
    private feeScheduleService: FeeScheduleService,
    private dialog: MatDialog,
    private feeInvoiceService: FeeInvoiceService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.addKidForm = this.fb.group({
      parentId: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      enrollmentDate: ['', [Validators.required]],
      feeDetails: this.fb.array([])
    });

    this.searchForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      status: [''],
      parentName: ['']
    });

    this.outstandingForm = this.fb.group({
      parentId: [''],
      dueDateBefore: ['']
    });
  }

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadKids();
        if (this.isAdminOrSuperAdmin()) {
          this.loadFeeSchedules();
          this.loadParents();
        }
      },
      error: (err) => alert('Failed to load user: ' + (err.error || 'Unknown error'))
    });
  }

  get feeDetails(): FormArray {
    return this.addKidForm.get('feeDetails') as FormArray;
  }

  addFeeDetail() {
    const feeDetailForm = this.fb.group({
      feeScheduleId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      chargeType: ['', [Validators.required]],
      isOneOff: [false],
      isRecurring: [false],
      recurrenceInterval: [''],
      prorate: [false],
      dueDate: [''] // Field for one-off due date
    });

    feeDetailForm.get('isOneOff')?.valueChanges.subscribe(value => {
      if (value) {
        feeDetailForm.get('isRecurring')?.setValue(false);
        feeDetailForm.get('chargeType')?.setValue('ONE_OFF');
        feeDetailForm.get('recurrenceInterval')?.setValue(null);
        feeDetailForm.get('prorate')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.clearValidators();
      } else if (!feeDetailForm.get('isRecurring')?.value) {
        feeDetailForm.get('chargeType')?.setValue('');
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    feeDetailForm.get('isRecurring')?.valueChanges.subscribe(value => {
      if (value) {
        feeDetailForm.get('isOneOff')?.setValue(false);
        feeDetailForm.get('chargeType')?.setValue('RECURRING');
        feeDetailForm.get('recurrenceInterval')?.setValidators([Validators.required]);
      } else if (!feeDetailForm.get('isOneOff')?.value) {
        feeDetailForm.get('chargeType')?.setValue('');
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    feeDetailForm.get('chargeType')?.valueChanges.subscribe(value => {
      if (value === 'ONE_OFF') {
        feeDetailForm.get('isOneOff')?.setValue(true);
        feeDetailForm.get('isRecurring')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.setValue(null);
        feeDetailForm.get('prorate')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.clearValidators();
      } else if (value === 'RECURRING') {
        feeDetailForm.get('isOneOff')?.setValue(false);
        feeDetailForm.get('isRecurring')?.setValue(true);
        feeDetailForm.get('recurrenceInterval')?.setValidators([Validators.required]);
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    this.feeDetails.push(feeDetailForm);
  }

  toggleChargeType(index: number, type: string, event: Event) {
    const feeDetailForm = this.feeDetails.at(index) as FormGroup;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      feeDetailForm.get('chargeType')?.setValue(type);
      feeDetailForm.get(type === 'ONE_OFF' ? 'isOneOff' : 'isRecurring')?.setValue(true);
      feeDetailForm.get(type === 'ONE_OFF' ? 'isRecurring' : 'isOneOff')?.setValue(false);
    } else {
      feeDetailForm.get('chargeType')?.setValue('');
      feeDetailForm.get(type === 'ONE_OFF' ? 'isOneOff' : 'isRecurring')?.setValue(false);
    }
  }

  removeFeeDetail(index: number) {
    this.feeDetails.removeAt(index);
  }

  isAdminOrSuperAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
  }

  loadKids() {
    if (this.isAdminOrSuperAdmin()) {
      this.kidService.getAllKids(this.searchForm.value.status).subscribe({
        next: (kids) => (this.kids = kids),
        error: (err) => alert('Failed to load kids: ' + (err.error || 'Unknown error'))
      });
    } else {
      this.kidService.getKidsByParent(this.user!.userId).subscribe({
        next: (kids) => (this.kids = kids),
        error: (err) => alert('Failed to load kids: ' + (err.error || 'Unknown error'))
      });
    }
  }

  loadParents() {
    this.userService.getParentUsers().subscribe({
      next: (parents) => (this.parents = parents),
      error: (err) => alert('Failed to load parents: ' + (err.error || 'Unknown error'))
    });
  }

  loadFeeSchedules() {
    this.feeScheduleService.getActiveFeeSchedules(new Date().toISOString().split('T')[0]).subscribe({
      next: (schedules) => (this.feeSchedules = schedules),
      error: (err) => alert('Failed to load fee schedules: ' + (err.error || 'Unknown error'))
    });
  }

  searchKids() {
    if (this.isAdminOrSuperAdmin()) {
      this.kidService.searchKids(this.searchForm.value).subscribe({
        next: (kids) => (this.kids = kids),
        error: (err) => alert('Failed to search kids: ' + (err.error || 'Unknown error'))
      });
    }
  }

  addKid() {
    if (this.addKidForm.invalid) {
      this.addKidForm.markAllAsTouched();
      return;
    }

    const kidRequest: KidRequest = {
      parentId: this.addKidForm.value.parentId,
      firstName: this.addKidForm.value.firstName,
      lastName: this.addKidForm.value.lastName,
      dateOfBirth: this.addKidForm.value.dateOfBirth,
      enrollmentDate: this.addKidForm.value.enrollmentDate,
      feeDetails: this.addKidForm.value.feeDetails.map((detail: any) => ({
        feeScheduleId: detail.feeScheduleId,
        amount: detail.amount,
        chargeType: detail.chargeType,
        recurrenceInterval: detail.recurrenceInterval,
        prorate: detail.prorate,
        dueDate: detail.dueDate // Include dueDate for one-off charges
      }))
    };

    this.kidService.addKid(kidRequest).subscribe({
      next: (kid) => {
        this.loadKids();
        this.addKidForm.reset();
        this.feeDetails.clear();
        // Fetch and display invoices and schedules
        this.feeInvoiceService.getInvoicesForKid(kid.kidId, '2000-01-01', '2100-12-31').subscribe({
          next: (invoices) => {
            this.recentInvoices = invoices;
            this.http.get<BillingSchedule[]>(`http://localhost:8082/api/billing-schedules/kid/${kid.kidId}`).subscribe({
              next: (schedules) => {
                this.recentSchedules = schedules;
                alert(`Kid added successfully! Generated ${invoices.length} invoices and ${schedules.length} billing schedules.`);
              },
              error: (err) => alert('Failed to load billing schedules: ' + (err.error || 'Unknown error'))
            });
          },
          error: (err) => alert('Failed to load invoices: ' + (err.error || 'Unknown error'))
        });
      },
      error: (err) => alert('Failed to add kid: ' + (err.error || 'Unknown error'))
    });
  }

  openEditDialog(kid: Kid) {
    if (!this.isAdminOrSuperAdmin()) return;

    const dialogRef = this.dialog.open(KidEditDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      data: { kid: { ...kid }, feeSchedules: this.feeSchedules }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadKids();
      }
    });
  }

  updateStatus(kid: Kid) {
    this.kidService.updateKidStatus(kid.kidId, kid.status).subscribe({
      next: () => this.loadKids(),
      error: (err) => alert('Failed to update status: ' + (err.error || 'Unknown error'))
    });
  }

  deleteKid(kidId: number) {
    if (!this.isAdminOrSuperAdmin()) return;

    if (confirm('Are you sure you want to delete this kid?')) {
      this.kidService.deleteKid(kidId).subscribe({
        next: () => this.loadKids(),
        error: (err) => alert('Failed to delete kid: ' + (err.error || 'Cannot delete kid with open invoices'))
      });
    }
  }

  openDetailsDialog(kid: Kid) {
    this.dialog.open(KidDetailsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      data: { kid }
    });
  }

  loadOutstandingBalances() {
    if (this.isAdminOrSuperAdmin()) {
      this.kidService.getKidsWithOutstandingBalances(this.outstandingForm.value).subscribe({
        next: (kidBalances) => (this.kidBalances = kidBalances),
        error: (err) => alert('Failed to load outstanding balances: ' + (err.error || 'Unknown error'))
      });
    }
  }
}