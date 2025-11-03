import { Component, Input } from '@angular/core';
import { Kpi } from 'src/app/models/kpi';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent {

  @Input() kpi!: Kpi;

}
