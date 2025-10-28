import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CashbookDTO } from 'src/app/models/cashbook-dto';
import { CashbookTransactionDTO } from 'src/app/models/cashbook-transaction-dto';
import { Page } from 'src/app/models/page';
import { User } from 'src/app/models/user';
import { CashbookService } from 'src/app/services/cashbook.service';
import { UserService } from 'src/app/services/user.service';
import { DateUtilsComponent } from 'src/app/utils/date-utils/date-utils.component';

@Component({
  selector: 'app-cashbooks',
  templateUrl: './cashbooks.component.html',
  styleUrls: ['./cashbooks.component.css']
})


export class CashbooksComponent implements OnInit {

  transactions: Page<CashbookTransactionDTO> = {
    content: [],
    pageable: { pageNumber: 0, pageSize: 10 },
    totalElements: 0,
    totalPages: 0
  };
  cashbooks: CashbookDTO[] = [];
  cashbookForm: FormGroup;
  selectedCashbookId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  pageable = { pageNumber: 0, pageSize: 10 };
  totalPages: number = 0;
  pages: number[] = [];
  loading: boolean = false;
  error: string | null = null;
  user: User | null = null;

  constructor(
    private userService: UserService,
    private cashbookService: CashbookService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.cashbookForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.setDefaultDates();
        if (this.isAdminOrSuperAdmin()) {

          this.loadCashbooks();
          this.loadTransactions();

       }
      }
    });
  }

  isAdminOrSuperAdmin(): boolean {
        return this.user?.role === 'ADMIN' || this.user?.role === 'SUPER_ADMIN';
      }

  private setDefaultDates() {
        const { startDate, endDate } = DateUtilsComponent.getDefaultDateRange();
        this.startDate = startDate;
        this.endDate = endDate;
      }

  loadCashbooks() {
        this.cashbookService.getAllCashbooks().subscribe({
          next: (cashbooks) => {
            this.cashbooks = cashbooks;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.error = 'Failed to load cashbooks: ' + (err.error?.message || 'Unknown error');
            this.toastr.error(this.error, 'Error');
          }
        });
      }

  createCashbook() {
        if (this.cashbookForm.valid) {
          this.cashbookService.createCashbook(this.cashbookForm.value).subscribe({
            next: () => {
              this.toastr.success('Cashbook created successfully!', 'Success');
              this.loadCashbooks();
              this.cashbookForm.reset();
              this.cdr.detectChanges();
            },
            error: (err) => this.toastr.error('Failed to create cashbook: ' + (err.error?.message || 'Unknown error'), 'Error')
          });
        }
      }

  updateCashbook(cashbook: CashbookDTO) {
        this.cashbookService.updateCashbook(cashbook.cashbookId!, cashbook).subscribe({
          next: () => {
            this.toastr.success('Cashbook updated successfully!', 'Success');
            this.loadCashbooks();
            this.cdr.detectChanges();
          },
          error: (err) => this.toastr.error('Failed to update cashbook: ' + (err.error?.message || 'Unknown error'), 'Error')
        });
      }

  deleteCashbook(id: number) {
        if (confirm('Are you sure you want to delete this cashbook?')) {
          this.cashbookService.deleteCashbook(id).subscribe({
            next: () => {
              this.toastr.success('Cashbook deleted successfully!', 'Success');
              this.loadCashbooks();
              this.cdr.detectChanges();
            },
            error: (err) => this.toastr.error('Failed to delete cashbook: ' + (err.error?.message || 'Unknown error'), 'Error')
          });
        }
      }

  loadTransactions() {
        const start = `${this.startDate}T00:00:00`;
        const end = `${this.endDate}T23:59:59`;
        this.loading = true;
        if (this.selectedCashbookId) {
          this.cashbookService.getCashbookTransactions(this.selectedCashbookId, start, end, this.pageable.pageNumber, this.pageable.pageSize).subscribe({
            next: (page) => {
              this.transactions = page;
              this.totalPages = page.totalPages;
              this.pages = Array.from({ length: page.totalPages }, (_, i) => i);
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.error = 'Failed to load transactions: ' + (err.error?.message || 'Unknown error');
              this.toastr.error(this.error, 'Error');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.cashbookService.getAllCashbookTransactions(start, end, this.pageable.pageNumber, this.pageable.pageSize).subscribe({
            next: (page) => {
              this.transactions = page;
              this.totalPages = page.totalPages;
              this.pages = Array.from({ length: page.totalPages }, (_, i) => i);
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.error = 'Failed to load transactions: ' + (err.error?.message || 'Unknown error');
              this.toastr.error(this.error, 'Error');
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        }
      }

  changePage(page: number) {
        if (page >= 0 && page < this.totalPages) {
          this.pageable.pageNumber = page;
          this.loadTransactions();
        }
      }

  onCashbookChange(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this.selectedCashbookId = selectElement.value ? Number(selectElement.value) : null;
        this.pageable.pageNumber = 0; // Reset to first page
        this.loadTransactions();
      }
    }
