import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataset, ChartOptions } from 'chart.js';
import { ChartData } from 'src/app/models/chart-data';


@Component({
  selector: 'app-invoice-payment-chart',
  templateUrl: './invoice-payment-chart.component.html',
  styleUrls: ['./invoice-payment-chart.component.css']
})
export class InvoicePaymentChartComponent implements OnChanges {

 @Input() data!: ChartData;

  barChartLabels: string[] = [];
  barChartData: ChartDataset[] = [];
  barChartOptions: ChartOptions = {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.barChartLabels = this.data.labels;
      this.barChartData = [
        { data: this.data.invoices, label: 'Invoices', backgroundColor: '#28a745' },
        { data: this.data.payments, label: 'Payments', backgroundColor: '#ffc107' }
      ];
    }
  }
}
