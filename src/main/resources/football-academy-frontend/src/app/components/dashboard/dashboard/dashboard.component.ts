import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Aging } from 'src/app/models/aging';
import { ChartData } from 'src/app/models/chart-data';
import { Kpi } from 'src/app/models/kpi';
import { User } from 'src/app/models/user';
import { FeeInvoiceService } from 'src/app/services/fee-invoice.service';
import { KidService } from 'src/app/services/kid.service';
import { PaymentService } from 'src/app/services/payment.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  user: User | null = null;
  loading = true;

  kpis: Kpi[] = [];
  chartData: ChartData = { labels: [], invoices: [], payments: [] };
  balanceAging: Aging = { within30: 0, within60: 0, within90: 0, within120: 0, over120: 0 };

  constructor(
    private userService: UserService,
    private kidService: KidService,
    private paymentService: PaymentService,
    private invoiceService: FeeInvoiceService
  ) { }

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (!email) {
      alert('No user email found. Please log in again.');
      return;
    }

    const { start, end } = this.getDefaultDateRange();

    combineLatest([
      this.userService.getUserByEmail(email),
      this.kidService.getAllKids(),
      this.invoiceService.getInvoiceSummary(start, end),
      this.paymentService.getPaymentSummary(start, end),
      this.paymentService.getOutstandingBalances()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([user, kids, invSummary, paySummary, balances]) => {
          this.user = user;
          this.buildKpis(kids?.length ?? 0, invSummary ?? {}, paySummary ?? {}, balances ?? []);
          this.buildChartData(invSummary ?? {}, paySummary ?? {});
          this.buildAgingData(balances ?? []);
          this.loading = false;
        },
        error: err => {
          console.error('Dashboard load error:', err);
          alert('Failed to load dashboard data');
          this.loading = false;
        }
      });
  }

  // ---------- KPI ----------
  private buildKpis(kidsCount: number, inv: any, pay: any, balances: any[]) {
    const totalOutstanding = balances.reduce((s, b) => s + (b.outstandingBalance ?? 0), 0);
    const todayPayments = pay.today ?? 0;

    this.kpis = [
      { title: 'Total Kids', subtitle: 'Active players', value: kidsCount, icon: 'fa-users', color: '#007bff' },
      { title: 'Invoices Today', subtitle: 'Generated', value: inv.today ?? 0, change: inv.change, icon: 'fa-file-invoice', color: '#28a745' },
      { title: 'Payments Today', subtitle: 'Received', value: todayPayments, change: pay.change, icon: 'fa-money-check-alt', color: '#ffc107' },
      { title: 'Outstanding', subtitle: 'Total due', value: totalOutstanding, icon: 'fa-exclamation-circle', color: '#dc3545' }
    ];
  }

  // ---------- CHART ----------
  private buildChartData(inv: any, pay: any) {
    const days = 7;
    const labels = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d.toLocaleDateString('en-GB', { weekday: 'short' });
    });

    this.chartData = {
      labels,
      invoices: inv.last7Days ?? [],
      payments: pay.last7Days ?? []
    };
  }

  // ---------- AGING ----------
  private buildAgingData(balances: any[]) {
    balances.forEach(b => {
      this.balanceAging.within30 += b.within30Days ?? 0;
      this.balanceAging.within60 += b.within60Days ?? 0;
      this.balanceAging.within90 += b.within90Days ?? 0;
      this.balanceAging.within120 += b.within120Days ?? 0;
      this.balanceAging.over120 += b.over120Days ?? 0;
    });
  }

  get isAdminOrSuperAdmin(): boolean {
    return ['ADMIN', 'SUPER_ADMIN'].includes(this.user?.role ?? '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getDefaultDateRange(): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30); // Last 30 days

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

}
