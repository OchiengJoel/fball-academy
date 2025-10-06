import { Component, OnInit } from '@angular/core';
import { Kid } from 'src/app/models/kid';
import { Page } from 'src/app/models/page';
import { Payment } from 'src/app/models/payment';
import { User } from 'src/app/models/user';
import { KidService } from 'src/app/services/kid.service';
import { PaymentService } from 'src/app/services/payment.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  payments: Page<Payment> = { content: [], pageable: { pageNumber: 0, pageSize: 10 }, totalElements: 0, totalPages: 0 };
  kids: Kid[] = [];
  user: User | null = null;
  selectedKidId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  pageable = { pageNumber: 0, pageSize: 10 };
  totalPages: number = 0;
  pages: number[] = [];
  payment: Payment = {
    paymentId: 0,
    kid: { kidId: 0 } as Kid, 
    amount: 0, 
    paymentMethod: 'CASH', 
    paymentDate: '', 
    createdAt: '', 
    updatedAt: '', 
    status: 'PENDING'
  };

  constructor(private paymentService: PaymentService, private kidService: KidService, private userService: UserService) { }

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        this.kidService.getKidsByParent(user.userId).subscribe({
          next: (kids) => (this.kids = kids),
        });
      },
    });
  }

  recordPayment() {
    this.paymentService.recordPayment(this.payment).subscribe({
      next: () => this.loadPayments(),
    });
  }

  loadPayments() {
    if (this.selectedKidId && this.startDate && this.endDate) {
      this.paymentService.getPaymentsForKid(this.selectedKidId, this.startDate, this.endDate, this.pageable.pageNumber, this.pageable.pageSize).subscribe({
        next: (page) => {
          this.payments = page;
          this.totalPages = page.totalPages;
          this.pages = Array.from({ length: page.totalPages }, (_, i) => i);
        },
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageable.pageNumber = page;
      this.loadPayments();
    }
  }

}
