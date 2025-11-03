import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Aging } from 'src/app/models/aging';

@Component({
  selector: 'app-balance-aging-chart',
  templateUrl: './balance-aging-chart.component.html',
  styleUrls: ['./balance-aging-chart.component.css']
})
export class BalanceAgingChartComponent implements OnChanges {

  @Input() aging!: Aging;

  doughnutLabels = ['<30d', '30-60d', '60-90d', '90-120d', '>120d'];
  doughnutDatasets = [
    {
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1']
    }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aging'] && this.aging) {
      this.doughnutDatasets[0].data = [
        this.aging.within30,
        this.aging.within60,
        this.aging.within90,
        this.aging.within120,
        this.aging.over120
      ];
    }
  }

}
