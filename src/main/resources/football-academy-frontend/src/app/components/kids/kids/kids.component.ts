import { ChangeDetectorRef, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { Kid } from 'src/app/models/kid';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';
import { KidDetailsDialogComponent } from '../kid-details-dialog/kid-details-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KidEditDialogComponent } from '../kid-edit-dialog/kid-edit-dialog.component';
import { FeeInvoice } from 'src/app/models/fee-invoice';
import { BillingSchedule } from 'src/app/models/billing-schedule';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { HttpClient } from '@angular/common/http';
import { BillingScheduleService } from 'src/app/services/billing-schedule.service';
import { ItemType } from '../../enums/item-type.enum';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentService } from 'src/app/services/payment.service';
import { KidOutstandingBalance } from 'src/app/models/kid-outstanding-balance';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-kids',
  templateUrl: './kids.component.html',
  styleUrls: ['./kids.component.css']
})
export class KidsComponent implements OnInit {

  kids: Kid[] = [];
  kid: Kid;
  addKidForm: FormGroup;
  searchForm: FormGroup;
  billingSchedules: BillingSchedule[] = [];
  parents: User[] = [];
  recentInvoices: FeeInvoice[] = [];
  recentSchedules: BillingSchedule[] = [];
  itemTypes = Object.keys(ItemType) as (keyof typeof ItemType)[];
  feeTypes = ['ONE_OFF', 'RECURRING'];
  user: User | null = null;
  recurrenceIntervals = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY', 'ONE_TIME'];
  loading: boolean = false;
  error: string | null = null;
  dataSource = new MatTableDataSource<Kid>([]);
  balances: KidOutstandingBalance[] = [];
  outstandingForm: FormGroup;


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private kidService: KidService,
    private userService: UserService,
    private billingScheduleService: BillingScheduleService,
    private feeInvoiceService: FeeInvoiceService,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { kid: Kid }

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

    this.kid = data?.kid || {} as Kid;
  }

  ngOnInit() {
    this.loading = true;
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadKids();
        this.loadBalancesForKids();
        if (this.isAdminOrSuperAdmin()) {
          this.loadParents();
          this.loadOutstandingBalances();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  get feeDetails(): FormArray {
    return this.addKidForm.get('feeDetails') as FormArray;
  }

  addFeeDetail() {
    const feeDetailForm = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      chargeType: ['', [Validators.required]],
      itemType: ['', [Validators.required]],
      recurrenceInterval: [''],
      prorate: [false],
      dueDate: ['']
    });

    feeDetailForm.get('chargeType')?.valueChanges.subscribe(value => {
      if (value === 'ONE_OFF') {
        feeDetailForm.get('recurrenceInterval')?.setValue('ONE_TIME');
        feeDetailForm.get('prorate')?.setValue(false);
        feeDetailForm.get('recurrenceInterval')?.clearValidators();
      } else if (value === 'RECURRING') {
        feeDetailForm.get('recurrenceInterval')?.setValidators([Validators.required]);
        feeDetailForm.get('recurrenceInterval')?.setValue('MONTHLY'); // Default to MONTHLY
      }
      feeDetailForm.get('recurrenceInterval')?.updateValueAndValidity();
    });

    this.feeDetails.push(feeDetailForm);
  }

  removeFeeDetail(index: number) {
    this.feeDetails.removeAt(index);
  }

  isAdminOrSuperAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
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

  loadKids() {
    this.loading = true;
    if (this.isAdminOrSuperAdmin()) {
      this.kidService.getAllKids(this.searchForm.value.status).subscribe({
        next: (kids) => {
          this.kids = kids;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load kids: ' + (err.error?.message || 'Unknown error');
          this.loading = false;
        }
      });
    } else {
      this.kidService.getKidsByParent(this.user!.userId).subscribe({
        next: (kids) => {
          this.kids = kids;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load kids: ' + (err.error?.message || 'Unknown error');
          this.loading = false;
        }
      });
    }
  }

  loadParents() {
    this.loading = true;
    this.userService.getParentUsers().subscribe({
      next: (parents) => {
        this.parents = parents;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load parents: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  loadBalancesForKids(): void {
    this.paymentService.getOutstandingBalances().subscribe({
      next: (balances) => {
        this.balances = balances;
        this.kids = this.kids.map(kid => ({
          ...kid,
          outstandingBalance: balances.find(b => b.kidId === kid.kidId)?.outstandingBalance ?? 0
        }));
        this.dataSource.data = this.kids;
        this.toastr.success('Outstanding balances loaded successfully', 'Success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load outstanding balances: ' + (err.error?.message || 'Unknown error'), 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  loadBillingSchedules() {
    this.billingScheduleService.getBillingSchedulesForKid(this.kid.kidId).subscribe({
      next: (schedules) => (this.billingSchedules = schedules),
      error: (err) => alert('Failed to load billing schedules: ' + (err.error || 'Unknown error'))
    });
  }

  searchKids() {
    if (this.isAdminOrSuperAdmin()) {
      this.loading = true;
      this.kidService.searchKids(this.searchForm.value).subscribe({
        next: (kids) => {
          this.kids = kids;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to search kids: ' + (err.error?.message || 'Unknown error');
          this.loading = false;
        }
      });
    }
  }

  addKid() {
    if (this.addKidForm.invalid) {
      this.addKidForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const kidRequest = {
      parentId: this.addKidForm.value.parentId,
      firstName: this.addKidForm.value.firstName,
      lastName: this.addKidForm.value.lastName,
      dateOfBirth: this.addKidForm.value.dateOfBirth,
      enrollmentDate: this.addKidForm.value.enrollmentDate,
      feeDetails: this.addKidForm.value.feeDetails.map((detail: any) => ({
        description: detail.description,
        amount: detail.amount,
        chargeType: detail.chargeType,
        itemType: detail.itemType,
        recurrenceInterval: detail.chargeType === 'ONE_OFF' ? 'ONE_TIME' : detail.recurrenceInterval,
        prorate: detail.prorate,
        dueDate: detail.dueDate
      }))
    };

    this.kidService.addKid(kidRequest).subscribe({
      next: (kid) => {
        this.loadKids();
        this.addKidForm.reset();
        this.feeDetails.clear();
        this.feeInvoiceService.getInvoicesForKid(kid.kidId, '2000-01-01', '2100-12-31').subscribe({
          next: (invoices) => {
            this.recentInvoices = invoices;
            this.http.get<BillingSchedule[]>(`http://localhost:8082/api/billing-schedules/kid/${kid.kidId}`).subscribe({
              next: (schedules) => {
                this.recentSchedules = schedules;
                this.loading = false;
                alert(`Kid added successfully! Generated ${invoices.length} invoices and ${schedules.length} billing schedules.`);
              },
              error: (err) => {
                this.error = 'Failed to load billing schedules: ' + (err.error?.message || 'Unknown error');
                this.loading = false;
              }
            });
          },
          error: (err) => {
            this.error = 'Failed to load invoices: ' + (err.error?.message || 'Unknown error');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to add kid: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  openEditDialog(kid: Kid) {
    if (!this.isAdminOrSuperAdmin()) return;

    const dialogRef = this.dialog.open(KidEditDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog-container',
      data: { kid: { ...kid }, billingSchedules: this.billingSchedules }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadKids();
      }
    });
  }

  updateStatus(kid: Kid) {
    this.loading = true;
    this.kidService.updateKidStatus(kid.kidId, kid.status).subscribe({
      next: () => {
        this.loadKids();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to update status: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  deleteKid(kidId: number) {
    if (!this.isAdminOrSuperAdmin()) return;

    if (confirm('Are you sure you want to delete this kid?')) {
      this.loading = true;
      this.kidService.deleteKid(kidId).subscribe({
        next: () => {
          this.loadKids();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete kid: ' + (err.error?.message || 'Cannot delete kid with open invoices');
          this.loading = false;
        }
      });
    }
  }

  openDetailsDialog(kid: Kid) {
    const dialogRef = this.dialog.open(KidDetailsDialogComponent, {
      width: '90vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { kid },
      disableClose: false,
      autoFocus: true,
      position: { top: '50px' }
    });
  }

  loadOutstandingBalances(): void {
    console.log('Fetching outstanding balances');
    this.paymentService.getOutstandingBalances().subscribe({
      next: (response) => {
        console.log('Outstanding balances loaded:', response);
        this.balances = response;
        this.toastr.success('Outstanding balances loaded successfully', 'Success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load outstanding balances:', err);
        this.error = 'Failed to load outstanding balances: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
      }
    });
  }

}