import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CashbookDTO } from 'src/app/models/cashbook-dto';
import { CashbookTransactionDTO } from 'src/app/models/cashbook-transaction-dto';
import { CashbookService } from 'src/app/services/cashbook.service';

@Component({
  selector: 'app-cashbooks',
  templateUrl: './cashbooks.component.html',
  styleUrls: ['./cashbooks.component.css']
})


export class CashbooksComponent implements OnInit {
  
  cashbooks: CashbookDTO[] = [];
  cashbookForm: FormGroup;
  transactions: CashbookTransactionDTO[] = [];
  selectedCashbookId: number | null = null;
  startDate: string = '';
  endDate: string = '';

  constructor(
    private cashbookService: CashbookService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.cashbookForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.setDefaultDates();
    this.loadCashbooks();
  }

  private setDefaultDates() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    this.startDate = oneMonthAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  loadCashbooks() {
    this.cashbookService.getAllCashbooks().subscribe({
      next: (cashbooks) => (this.cashbooks = cashbooks)
    });
  }

  createCashbook() {
    if (this.cashbookForm.valid) {
      this.cashbookService.createCashbook(this.cashbookForm.value).subscribe({
        next: () => {
          this.toastr.success('Cashbook created successfully!', 'Success');
          this.loadCashbooks();
          this.cashbookForm.reset();
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
        },
        error: (err) => this.toastr.error('Failed to delete cashbook: ' + (err.error?.message || 'Unknown error'), 'Error')
      });
    }
  }

  loadTransactions() {
    if (this.selectedCashbookId && this.startDate && this.endDate) {
      this.cashbookService.getCashbookTransactions(this.selectedCashbookId, this.startDate, this.endDate).subscribe({
        next: (transactions) => (this.transactions = transactions)
      });
    }
  }
}
