import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeeInvoice } from '../models/fee-invoice';
import { catchError, Observable, throwError } from 'rxjs';

import { PaginatedResponse } from '../models/page';
import { ItemType } from '../components/enums/item-type.enum';
import { InvoiceItemRequest } from '../models/invoice-item-request';
import { ManualInvoiceRequest } from '../models/manual-invoice-request';
import { KidOutstandingBalance } from '../models/kid-outstanding-balance';


@Injectable({
    providedIn: 'root'
})

export class FeeInvoiceService {
  private apiUrl = 'http://localhost:8082/api/fee-invoices';

  constructor(private http: HttpClient) {}

  // createInvoice(kidId: number, dueDate: string): Observable<FeeInvoice> {
  //   return this.http
  //     .post<FeeInvoice>(`${this.apiUrl}/generate`, { kidId, dueDate })
  //     .pipe(catchError(this.handleError));
  // }

  createInvoice(request: any): Observable<FeeInvoice> {
        return this.http.post<FeeInvoice>(this.apiUrl, request).pipe(catchError(this.handleError));
    }


  createManualInvoice(request: ManualInvoiceRequest): Observable<FeeInvoice> {
        return this.http.post<FeeInvoice>(`${this.apiUrl}/manual`, request).pipe(catchError(this.handleError));
    }

  generateBatchInvoices(request: { kidIds: number[]; startDate: string; endDate: string; dueDate: string }): Observable<FeeInvoice[]> {
    return this.http
      .post<FeeInvoice[]>(`${this.apiUrl}/batch`, request)
      .pipe(catchError(this.handleError));
  }

  deleteInvoice(invoiceId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${invoiceId}`)
      .pipe(catchError(this.handleError));
  }

  getInvoicesForKid(kidId: number, start: string, end: string): Observable<FeeInvoice[]> {
    return this.http
      .get<FeeInvoice[]>(`${this.apiUrl}/kid/${kidId}`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getOutstandingBalance(kidId: number, start: string, end: string): Observable<number> {
    return this.http
      .get<number>(`${this.apiUrl}/balance/${kidId}`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getOutstandingBalancesForUser(start: string, end: string): Observable<KidOutstandingBalance[]> {
    return this.http
      .get<KidOutstandingBalance[]>(`${this.apiUrl}/balances/user`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getAllInvoices(start: string, end: string): Observable<PaginatedResponse<FeeInvoice>> {
    return this.http
      .get<PaginatedResponse<FeeInvoice>>(`${this.apiUrl}/all`, { params: { start, end } })
      .pipe(catchError(this.handleError));
  }

  getFinancialReport(start: string, end: string): Observable<{ [key in keyof typeof ItemType]: number }> {
    return this.http
      .get<{ [key in keyof typeof ItemType]: number }>(`${this.apiUrl}/report`, { params: { start, end } })
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


