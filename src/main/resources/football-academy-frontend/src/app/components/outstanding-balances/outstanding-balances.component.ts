import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { KidOutstandingBalance } from 'src/app/models/kid-outstanding-balance';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-outstanding-balances',
  templateUrl: './outstanding-balances.component.html',
  styleUrls: ['./outstanding-balances.component.css']
})
export class OutstandingBalancesComponent {

  balances: KidOutstandingBalance[] = [];
  error: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOutstandingBalances();
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
