import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CashbookDTO } from 'src/app/models/cashbook-dto';
import { InvoiceItemAllocationDTO } from 'src/app/models/invoice-item-allocation-dto';
import { Kid } from 'src/app/models/kid';
import { Page } from 'src/app/models/page';
import { Payment } from 'src/app/models/payment';
import { PaymentAllocationRequest } from 'src/app/models/payment-allocation-request';
import { User } from 'src/app/models/user';
import { CashbookService } from 'src/app/services/cashbook.service';
import { KidService } from 'src/app/services/kid.service';
import { PaymentService } from 'src/app/services/payment.service';
import { UserService } from 'src/app/services/user.service';
import { DateUtilsComponent } from 'src/app/utils/date-utils/date-utils.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: Page<Payment> = { content: [], pageable: { pageNumber: 0, pageSize: 50 }, totalElements: 0, totalPages: 0 };
  kids: Kid[] = [];
  cashbooks: CashbookDTO[] = [];
  user: User | null = null;
  selectedKidId: number | null = null;
  invoiceItems: InvoiceItemAllocationDTO[] = [];
  paymentForm: FormGroup;
  startDate: string = '';
  endDate: string = '';
  pageable = { pageNumber: 0, pageSize: 10 };
  totalPages: number = 0;
  pages: number[] = [];
  overpaymentBalance: number = 0;
  loading: boolean = false;
  error: string | null = null;
  includeInactiveKids: boolean = false;

  constructor(
    private paymentService: PaymentService,
    private kidService: KidService,
    private cashbookService: CashbookService,
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.paymentForm = this.fb.group({
      kidId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentDate: ['', Validators.required],
      bankingDate: [''],
      transactionId: [''],
      paymentMethod: ['CASH', Validators.required],
      cashbookId: ['', Validators.required],
      allocations: this.fb.array([])
    });
  }

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.loadInitialData();
        // Load all payments by default if user is ADMIN or SUPER_ADMIN
        if (this.isAdminOrSuperAdmin()) {
          this.loadPayments();
        }
      }
    });
  }

  private loadInitialData() {
    this.setDefaultDates();
    this.loadKids();
    this.loadCashbooks();
  }

  isAdminOrSuperAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
  }

  private loadKids() {
    this.loading = true;
    if (this.isAdminOrSuperAdmin()) {
      const status = this.includeInactiveKids ? undefined : 'ACTIVE';
      this.kidService.getAllKids(status).subscribe({
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

  onIncludeInactiveKidsChange(checked: boolean) {
    this.includeInactiveKids = checked;
    this.loadKids();
  }

  private loadCashbooks() {
    this.cashbookService.getAllCashbooks().subscribe({
      next: (cashbooks) => (this.cashbooks = cashbooks)
    });
  } 

  private setDefaultDates() {
  const { startDate, endDate } = DateUtilsComponent.getDefaultDateRange();
  this.startDate = startDate;
  this.endDate = endDate;
  this.paymentForm.patchValue({ paymentDate: endDate });
}

  loadOpenInvoiceItems() {
    if (this.selectedKidId) {
      this.paymentService.getOpenInvoiceItems(this.selectedKidId).subscribe({
        next: (items) => {
          console.log('Received invoice items:', items);
          this.invoiceItems = items;
          const allocations = this.paymentForm.get('allocations') as FormArray;
          allocations.clear();
          items.forEach(item => {
            allocations.push(this.fb.group({
              invoiceItemId: [item.invoiceItemId, Validators.required],
              allocatedAmount: [0, [Validators.min(0), Validators.max(item.amountDue)]]
            }));
            item.balance = item.amountDue;
          });
          console.log('Allocations FormArray length:', allocations.length);
          this.cdr.detectChanges();
        }
      });
      this.paymentService.getOverpaymentBalance(this.selectedKidId).subscribe({
        next: (balance) => (this.overpaymentBalance = balance)
      });
    } else {
      this.invoiceItems = [];
      const allocations = this.paymentForm.get('allocations') as FormArray;
      allocations.clear();
      this.cdr.detectChanges();
    }
  }

  updateBalance(index: number) {
    const allocations = this.paymentForm.get('allocations') as FormArray;
    const allocatedAmount = allocations.at(index).get('allocatedAmount')?.value || 0;
    this.invoiceItems[index].allocationAmount = allocatedAmount;
    this.invoiceItems[index].balance = this.invoiceItems[index].amountDue - allocatedAmount;
  }

  recordPayment() {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      const request: PaymentAllocationRequest = {
        kidId: formValue.kidId,
        amount: formValue.amount,
        paymentDate: formValue.paymentDate ? `${formValue.paymentDate}T00:00:00` : new Date().toISOString(),
        bankingDate: formValue.bankingDate || undefined,
        transactionId: formValue.transactionId || undefined,
        paymentMethod: formValue.paymentMethod,
        cashbookId: formValue.cashbookId,
        allocations: formValue.allocations
      };
      this.paymentService.allocatePayment(request).subscribe({
        next: () => {
          this.toastr.success('Payment allocated successfully!', 'Success');
          this.loadOpenInvoiceItems();
          this.loadPayments();
        },
        error: (err) => this.toastr.error('Failed to allocate payment: ' + (err.error?.message || 'Unknown error'), 'Error')
      });
    } else {
      this.toastr.warning('Please fill out all required fields correctly.', 'Warning');
    }
  }

  loadPayments() {
    const start = `${this.startDate}T00:00:00`;
    const end = `${this.endDate}T23:59:59`;
    this.loading = true;
    if (this.selectedKidId) {
      this.paymentService.getPaymentsForKid(this.selectedKidId, start, end, this.pageable.pageNumber, this.pageable.pageSize).subscribe({
        next: (page) => {
          this.payments = page;
          this.totalPages = page.totalPages;
          this.pages = Array.from({ length: page.totalPages }, (_, i) => i);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load payments: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else {
      this.paymentService.getAllPayments(start, end, this.pageable.pageNumber, this.pageable.pageSize).subscribe({
        next: (page) => {
          this.payments = page;
          this.totalPages = page.totalPages;
          this.pages = Array.from({ length: page.totalPages }, (_, i) => i);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load payments: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageable.pageNumber = page;
      this.loadPayments();
    }
  }

  get allocations(): FormArray {
    return this.paymentForm.get('allocations') as FormArray;
  }

  onKidChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedKidId = selectElement.value ? Number(selectElement.value) : null;
    this.loadOpenInvoiceItems();
    this.loadPayments();
  }

  deletePayment(paymentId: number) {
    if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      this.paymentService.deletePayment(paymentId).subscribe({
        next: () => {
          this.toastr.success('Payment deleted successfully!', 'Success');
          this.loadPayments();
          this.loadOpenInvoiceItems();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to delete payment: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }

  reversePayment(paymentId: number) {
    if (confirm('Are you sure you want to reverse this payment? This will create a contra-entry and mark the payment as FAILED.')) {
      this.paymentService.reversePayment(paymentId).subscribe({
        next: () => {
          this.toastr.success('Payment reversed successfully!', 'Success');
          this.loadPayments();
          this.loadOpenInvoiceItems();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to reverse payment: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }

  undoReversePayment(paymentId: number) {
    if (confirm('Are you sure you want to undo the reversal of this payment? This will restore the payment and its allocations.')) {
      this.paymentService.undoReversePayment(paymentId).subscribe({
        next: () => {
          this.toastr.success('Payment reversal undone successfully!', 'Success');
          this.loadPayments();
          this.loadOpenInvoiceItems();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to undo payment reversal: ' + (err.error?.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
        }
      });
    }
  }
}