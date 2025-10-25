import { Component, OnInit, ViewChild } from '@angular/core';
import { ItemType } from '../enums/item-type.enum';
import { MatTableDataSource } from '@angular/material/table';
import { BillingSchedulePeriod } from 'src/app/models/billing-schedule-period';
import { Kid } from 'src/app/models/kid';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { BillingScheduleService } from 'src/app/services/billing-schedule.service';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { KidService } from 'src/app/services/kid.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { InvoiceItemRequest } from 'src/app/models/invoice-item-request';

@Component({
  selector: 'app-billing-schedules',
  templateUrl: './billing-schedules.component.html',
  styleUrls: ['./billing-schedules.component.css']
})
export class BillingSchedulesComponent implements OnInit {

  displayedColumns: string[] = ['periodStart', 'periodEnd', 'description', 'amount', 'actions'];
  dataSource = new MatTableDataSource<BillingSchedulePeriod>([]);
  kids: Kid[] = [];
  filterForm: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  user: User | null = null;
  parents: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private billingScheduleService: BillingScheduleService,
    private userService: UserService,
    private feeInvoiceService: FeeInvoiceService,
    private kidService: KidService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      selectedKidId: ['', [Validators.required, Validators.min(1)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit() {
    this.loading = true;
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadKids();
        if (this.isAdminOrSuperAdmin()) {
          this.loadParents();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  isAdminOrSuperAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
  }

  loadKids() {
    this.loading = true;
    if (this.isAdminOrSuperAdmin()) {
      this.kidService.getAllKids(this.filterForm.value.status).subscribe({
        next: (kids) => {
          this.kids = kids;
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

  loadParents() {
    this.loading = true;
    this.userService.getParentUsers().subscribe({
      next: (parents) => {
        this.parents = parents;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load parents: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadBillingSchedules() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.error = null;
      const kidId = this.filterForm.value.selectedKidId;
      this.billingScheduleService.getBillingScheduleTable(kidId).subscribe({
        next: (periods) => {
          this.dataSource.data = periods;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to load billing schedules: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else {
      this.toastr.warning('Please select a kid.', 'Warning');
    }
  }

  generateInvoice(period: BillingSchedulePeriod) {
    if (period.hasInvoice) {
      this.toastr.warning('Invoice already exists for this period.', 'Warning');
      return;
    }
    this.loading = true;
    const kidId = this.filterForm.value.selectedKidId;
    this.feeInvoiceService.createInvoice(kidId).subscribe({
      next: () => {
        this.toastr.success('Invoice generated successfully!', 'Success');
        this.loadBillingSchedules();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Failed to generate invoice: ' + (err.error?.message || 'Unknown error');
        this.toastr.error(this.error, 'Error');
        this.loading = false;
      }
    });
  }

  toggleBlock(period: BillingSchedulePeriod) {
    const block = !period.blocked;
    const scheduleId = period.billingScheduleId;
    if (scheduleId) {
      this.billingScheduleService.toggleBlockSchedule(scheduleId, block).subscribe({
        next: () => {
          this.toastr.success(`Billing schedule ${block ? 'blocked' : 'unblocked'} successfully!`, 'Success');
          this.loadBillingSchedules();
        },
        error: (err: HttpErrorResponse) => {
          this.error = `Failed to ${block ? 'block' : 'unblock'} billing schedule: ` + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }

  deleteInvoice(period: BillingSchedulePeriod) {
    if (!period.hasInvoice) {
      this.toastr.warning('No invoice exists for this period.', 'Warning');
      return;
    }
    if (confirm('Are you sure you want to delete the invoice for this period?')) {
      const invoiceId = period.invoiceId;
      if (!invoiceId) {
        this.toastr.error('No invoice ID found for this period.', 'Error');
        return;
      }
      this.feeInvoiceService.deleteInvoice(invoiceId).subscribe({
        next: () => {
          this.toastr.success('Invoice deleted successfully!', 'Success');
          this.loadBillingSchedules();
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Failed to delete invoice: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }
}
