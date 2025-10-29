import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { BillingSchedule } from 'src/app/models/billing-schedule';
import { FeeInvoice } from 'src/app/models/fee-invoice';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { Kid } from 'src/app/models/kid';
import { PaginatedResponse } from 'src/app/models/page';
import { User } from 'src/app/models/user';
import { BillingScheduleService } from 'src/app/services/billing-schedule.service';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';
import { ItemType } from '../../enums/item-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FeeInvoiceFormDialogComponent } from '../../fee-invoice-form-dialog/fee-invoice-form-dialog.component';
import { BatchFeeInvoiceFormDialogComponent } from '../../batch-fee-invoice-form-dialog/batch-fee-invoice-form-dialog.component';
import { KidOutstandingBalance } from 'src/app/models/kid-outstanding-balance';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-fee-invoices',
  templateUrl: './fee-invoices.component.html',
  styleUrls: ['./fee-invoices.component.css']
})
export class FeeInvoicesComponent implements OnInit {
  //displayedColumns: string[] = ['invoiceId', 'invoiceNumber', 'kidName', 'items', 'amount', 'dueDate', 'status', 'actions'];
  displayedColumns: string[] = ['invoiceId', 'invoiceNumber', 'client', 'items', 'amount', 'dueDate', 'status', 'actions'];
  financialReport: { [key in keyof typeof ItemType]: number } | null = null;
  dataSource = new MatTableDataSource<FeeInvoice>([]);
  kids: Kid[] = [];
  kidBalances: KidOutstandingBalance[] = [];
  user: User | null = null;
  filterForm: FormGroup;
  balance: number = 0;
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  includeInactiveKids: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private feeInvoiceService: FeeInvoiceService,
    private paymentService: PaymentService,
    private kidService: KidService,
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private cdr : ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      selectedKidId: [''],
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required, this.endDateValidator()]]
    });
  }

  ngOnInit() {
    this.loading = true;
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadInitialData();
      },
      error: (err) => {
        this.error = 'Failed to load user: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadInitialData() {
    this.setDefaultDates();
    this.loadKids();
  }

  private loadKids() {
    this.loading = true;
    if (this.isAdminOrSuperAdmin()) {
      const status = this.includeInactiveKids ? undefined : 'ACTIVE';
      this.kidService.getAllKids(status).subscribe({
        next: (kids) => {
          this.kids = kids;
          this.loadAllInvoices();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load kids: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else {
      this.kidService.getKidsByParent(this.user!.userId).subscribe({
        next: (kids) => {
          this.kids = kids;
          this.loadAllInvoices();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load kids: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    }
  }

  onIncludeInactiveKidsChange(checked: boolean) {
    this.includeInactiveKids = checked;
    this.loadKids();
  }

  private setDefaultDates() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    this.filterForm.patchValue({
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }

  private endDateValidator() {
    return (control: AbstractControl) => {
      const endDate = new Date(control.value);
      const startDate = new Date(this.filterForm?.get('startDate')?.value);
      return endDate >= startDate ? null : { invalidEndDate: true };
    };
  }

  isAdminOrSuperAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
  }

  openCreateInvoiceDialog() {
    const dialogRef = this.dialog.open(FeeInvoiceFormDialogComponent, {
      width: '1200px',
      data: { kids: this.kids }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllInvoices();
        this.toastr.success('Invoice created successfully!', 'Success');
      }
    });
  }

  openBatchInvoiceDialog() {
    const dialogRef = this.dialog.open(BatchFeeInvoiceFormDialogComponent, {
      width: '500px',
      data: { kids: this.kids }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllInvoices();
        this.toastr.success('Batch invoices generated successfully!', 'Success');
      }
    });
  }

  loadAllInvoices(page: number = 0, size: number = 20) {
    if (this.filterForm.valid) {
      this.loading = true;
      this.error = null;
      this.feeInvoiceService.getAllInvoices(this.filterForm.value.startDate, this.filterForm.value.endDate).subscribe({
        next: (response: PaginatedResponse<FeeInvoice>) => {
          this.dataSource.data = response.content;
          this.paginator.length = response.totalElements;
          this.paginator.pageIndex = response.number;
          this.paginator.pageSize = response.size;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load all invoices: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else {
      this.toastr.warning('Please select valid start and end dates.', 'Warning');
    }
  }

  loadInvoices() {
    if (this.filterForm.valid && this.filterForm.value.selectedKidId) {
      this.loading = true;
      this.error = null;
      this.feeInvoiceService.getInvoicesForKid(
        this.filterForm.value.selectedKidId,
        this.filterForm.value.startDate,
        this.filterForm.value.endDate
      ).subscribe({
        next: (invoices) => {
          this.dataSource.data = invoices;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load invoices: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
      this.feeInvoiceService.getOutstandingBalance(
        this.filterForm.value.selectedKidId,
        this.filterForm.value.startDate,
        this.filterForm.value.endDate
      ).subscribe({
        next: (balance) => {
          this.balance = balance;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load balance: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else {
      this.loadAllInvoices();
    }
  }  

  loadOutstandingBalances(): void {
    console.log('Fetching outstanding balances');
    this.paymentService.getOutstandingBalances().subscribe({
      next: (response) => {
        console.log('Outstanding balances loaded:', response);
        this.kidBalances = response;
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

  deleteInvoice(invoiceId: number) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.feeInvoiceService.deleteInvoice(invoiceId).subscribe({
        next: () => {
          this.toastr.success('Invoice deleted successfully!', 'Success');
          this.loadInvoices();
        },
        error: (err) => {
          this.error = 'Failed to delete invoice: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }
}

