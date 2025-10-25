import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BillingSchedule } from '../models/billing-schedule';
import { catchError, Observable, throwError } from 'rxjs';
import { BillingSchedulePeriod } from '../models/billing-schedule-period';

@Injectable({
    providedIn: 'root'
})
export class BillingScheduleService {
  private apiUrl = 'http://localhost:8082/api/billing-schedules';

  constructor(private http: HttpClient) {}

  createBillingSchedule(billingSchedule: BillingSchedule): Observable<BillingSchedule> {
    return this.http.post<BillingSchedule>(this.apiUrl, billingSchedule).pipe(catchError(this.handleError));
  }

  getBillingSchedulesForKid(kidId: number): Observable<BillingSchedule[]> {
    return this.http
      .get<BillingSchedule[]>(`${this.apiUrl}/kid/${kidId}`)
      .pipe(catchError(this.handleError));
  }

  getActiveBillingSchedules(date: string): Observable<BillingSchedule[]> {
    return this.http
      .get<BillingSchedule[]>(`${this.apiUrl}/active`, { params: { date } })
      .pipe(catchError(this.handleError));
  }

  getBillingScheduleTable(kidId: number): Observable<BillingSchedulePeriod[]> {
    return this.http
      .get<BillingSchedulePeriod[]>(`${this.apiUrl}/table/${kidId}`)
      .pipe(catchError(this.handleError));
  }

  exportBillingSchedules(kidId: number, format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${kidId}`, {
      params: { format },
      responseType: 'blob'
    });
  }

  toggleBlockSchedule(billingScheduleId: number, block: boolean): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${billingScheduleId}/block`, { block })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
