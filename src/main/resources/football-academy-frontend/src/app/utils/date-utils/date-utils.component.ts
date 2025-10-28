import { Component } from '@angular/core';

@Component({
  selector: 'app-date-utils',
  templateUrl: './date-utils.component.html',
  styleUrls: ['./date-utils.component.css']
})
export class DateUtilsComponent {

  static getDefaultDateRange(): { startDate: string; endDate: string } {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return {
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  }

  static formatDateTime(date: string): string {
    return `${date}T00:00:00`;
  }

  static formatEndDateTime(date: string): string {
    return `${date}T23:59:59`;
  }

}
