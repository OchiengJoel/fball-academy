import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { BillingSchedule } from 'src/app/models/billing-schedule';
import { FeeInvoice } from 'src/app/models/fee-invoice';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { Kid, KidBalance } from 'src/app/models/kid';
import { PaginatedResponse } from 'src/app/models/page';
import { User } from 'src/app/models/user';
import { BillingScheduleService } from 'src/app/services/billing-schedule.service';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-fee-invoices',
  templateUrl: './fee-invoices.component.html',
  styleUrls: ['./fee-invoices.component.css']
})
export class FeeInvoicesComponent implements OnInit {
  displayedColumns: string[] = ['invoiceId', 'kidName', 'feeScheduleDescription', 'amount', 'dueDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<FeeInvoice>([]);
  billingSchedules: BillingSchedule[] = [];
  kids: Kid[] = [];
  kidBalances: KidBalance[] = [];
  user: User | null = null;
  invoiceForm: FormGroup;
  filterForm: FormGroup;
  balance: number = 0;
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private feeInvoiceService: FeeInvoiceService,
    private billingScheduleService: BillingScheduleService,
    private kidService: KidService,
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.invoiceForm = this.fb.group({
      kidId: ['', [Validators.required, Validators.min(1)]],
      billingScheduleId: ['', [Validators.required, Validators.min(1)]],
      dueDate: ['', [Validators.required, this.futureDateValidator()]]
    });
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
    this.kidService.getKidsByParent(this.user!.userId).subscribe({
      next: (kids) => {
        this.kids = kids;
        this.loadAllInvoices();
      },
      error: (err) => {
        this.error = 'Failed to load kids: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
    this.billingScheduleService.getActiveBillingSchedules(new Date().toISOString().split('T')[0]).subscribe({
      next: (schedules) => {
        this.billingSchedules = schedules;
      },
      error: (err) => {
        this.error = 'Failed to load fee schedules: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  private setDefaultDates() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    this.filterForm.patchValue({
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
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
      const startDate = new Date(this.filterForm?.get('startDate')?.value);
      return endDate >= startDate ? null : { invalidEndDate: true };
    };
  }

  isAdminOrSuperAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
  }

  createInvoice() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.toastr.warning('Please fill out all required fields correctly.', 'Warning');
      return;
    }
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    this.feeInvoiceService.createInvoice(
      this.invoiceForm.value.kidId,
      this.invoiceForm.value.feeScheduleId,
      this.invoiceForm.value.dueDate
    ).subscribe({
      next: () => {
        this.successMessage = 'Invoice created successfully!';
        this.toastr.success(this.successMessage, 'Success');
        this.loadAllInvoices();
        this.invoiceForm.reset();
        this.loading = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to create invoice: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
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

  loadAllKidBalances() {
    if (this.filterForm.valid && this.user) {
      this.loading = true;
      this.error = null;
      this.feeInvoiceService.getOutstandingBalancesForUser(this.filterForm.value.startDate, this.filterForm.value.endDate).subscribe({
        next: (balances) => {
          this.kidBalances = balances;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load kid balances: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else {
      this.toastr.warning('Please select valid start and end dates.', 'Warning');
    }
  }

  loadBillingSchedules() {
    this.billingScheduleService.getActiveBillingSchedules(new Date().toISOString().split('T')[0]).subscribe({
      next: (schedules) => {
        this.billingSchedules = schedules;
      },
      error: (err) => {
        this.error = 'Failed to load billing schedules: ' + (err.error?.message || 'Unknown error');
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

  toggleBlockSchedule(billingScheduleId: number, block: boolean) {
    const action = block ? 'block' : 'unblock';
    if (confirm(`Are you sure you want to ${action} this billing schedule?`)) {
      this.billingScheduleService.toggleBlockSchedule(billingScheduleId, block).subscribe({
        next: () => {
          this.toastr.success(`Billing schedule ${action}ed successfully!`, 'Success');
          this.loadBillingSchedules();
        },
        error: (err) => {
          this.error = `Failed to ${action} billing schedule: ` + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }
}

