import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeeInvoice } from '../models/fee-invoice';
import { catchError, Observable, throwError } from 'rxjs';
import { KidBalance } from '../models/kid';
import { PaginatedResponse } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class FeeInvoiceService {
  
  private apiUrl = 'http://localhost:8082/api/fee-invoices';

  constructor(private http: HttpClient) { }

  createInvoice(kidId: number, feeScheduleId: number, dueDate: string): Observable<FeeInvoice> {
    return this.http.post<FeeInvoice>(this.apiUrl, null, { params: { kidId: kidId.toString(), feeScheduleId: feeScheduleId.toString(), dueDate } })
      .pipe(catchError(this.handleError));
  }

  getInvoicesForKid(kidId: number, start: string, end: string): Observable<FeeInvoice[]> {
    return this.http.get<FeeInvoice[]>(`${this.apiUrl}/kid/${kidId}`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getOutstandingBalance(kidId: number, start: string, end: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/balance/${kidId}`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getOutstandingBalancesForUser(start: string, end: string): Observable<KidBalance[]> {
    return this.http.get<KidBalance[]>(`${this.apiUrl}/balances/user`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getAllInvoices(start: string, end: string): Observable<PaginatedResponse<FeeInvoice>> {
    return this.http.get<PaginatedResponse<FeeInvoice>>(`${this.apiUrl}/all`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
