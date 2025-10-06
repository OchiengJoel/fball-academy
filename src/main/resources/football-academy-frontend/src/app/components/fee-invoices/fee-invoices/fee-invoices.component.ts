import { Component } from '@angular/core';
import { FeeInvoice } from 'src/app/models/fee-invoice';
import { FeeSchedule } from 'src/app/models/fee-schedule';
import { Kid } from 'src/app/models/kid';
import { User } from 'src/app/models/user';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { FeeScheduleService } from 'src/app/services/fee-schedule.service';
import { KidService } from 'src/app/services/kid.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-fee-invoices',
  templateUrl: './fee-invoices.component.html',
  styleUrls: ['./fee-invoices.component.css']
})
export class FeeInvoicesComponent {

  invoices: FeeInvoice[] = [];
  feeSchedules: FeeSchedule[] = [];
  kids: Kid[] = [];
  user: User | null = null;
  invoice: { kidId: number; feeScheduleId: number; dueDate: string } = { kidId: 0, feeScheduleId: 0, dueDate: '' };
  selectedKidId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  balance: number = 0;

  constructor(
    private feeInvoiceService: FeeInvoiceService,
    private feeScheduleService: FeeScheduleService,
    private kidService: KidService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.kidService.getKidsByParent(user.userId).subscribe({
          next: (kids) => (this.kids = kids),
        });
        this.feeScheduleService.getActiveFeeSchedules(new Date().toISOString().split('T')[0]).subscribe({
          next: (schedules) => (this.feeSchedules = schedules),
        });
      },
    });
  }

  createInvoice() {
    this.feeInvoiceService.createInvoice(this.invoice.kidId, this.invoice.feeScheduleId, this.invoice.dueDate).subscribe({
      next: () => this.loadInvoices(),
    });
  }

  loadInvoices() {
    if (this.selectedKidId && this.startDate && this.endDate) {
      this.feeInvoiceService.getInvoicesForKid(this.selectedKidId, this.startDate, this.endDate).subscribe({
        next: (invoices) => (this.invoices = invoices),
      });
      this.feeInvoiceService.getOutstandingBalance(this.selectedKidId, this.startDate, this.endDate).subscribe({
        next: (balance) => (this.balance = balance),
      });
    }
  }

}
