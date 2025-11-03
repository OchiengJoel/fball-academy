import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Payment } from '../models/payment';
import { catchError, Observable, throwError } from 'rxjs';
import { Page } from '../models/page';
import { InvoiceItemAllocationDTO } from '../models/invoice-item-allocation-dto';
import { PaymentAllocationRequest } from '../models/payment-allocation-request';
import { KidOutstandingBalance } from '../models/kid-outstanding-balance';
import { DateUtilsComponent } from '../utils/date-utils/date-utils.component';
import { PaymentSummaryDTO } from '../models/payment-summary-dto';

@Injectable({
  providedIn: 'root'
})


export class PaymentService {
  
  private apiUrl = 'http://localhost:8082/api/payments';

  constructor(private http: HttpClient) {}

  getAllPayments(start: string, end: string, page: number, size: number): Observable<Page<Payment>> {
    return this.http.get<Page<Payment>>(this.apiUrl, {
      params: { start, end, page: page.toString(), size: size.toString() },
    });
  }

  allocatePayment(request: PaymentAllocationRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/allocate`, request);
  }

  getOpenInvoiceItems(kidId: number): Observable<InvoiceItemAllocationDTO[]> {
    return this.http.get<InvoiceItemAllocationDTO[]>(`${this.apiUrl}/open-invoice-items/${kidId}`);
  }

  getOverpaymentBalance(kidId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/overpayment-balance/${kidId}`);
  }

  recordPayment(payment: Payment, invoiceId?: number): Observable<Payment> {
    const params: { [key: string]: string } = {};
    if (invoiceId !== undefined) {
      params['invoiceId'] = invoiceId.toString();
    }
    return this.http.post<Payment>(this.apiUrl, payment, { params });
  }

  getPaymentsForKid(kidId: number, start: string, end: string, page: number, size: number): Observable<Page<Payment>> {
    return this.http.get<Page<Payment>>(`${this.apiUrl}/kid/${kidId}`, {
      params: { start, end, page: page.toString(), size: size.toString() },
    });
  }

  deletePayment(paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${paymentId}`);
  }

  reversePayment(paymentId: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${paymentId}/reverse`, {});
  }

  undoReversePayment(paymentId: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${paymentId}/undo-reverse`, {});
  }

  getOutstandingBalances(): Observable<KidOutstandingBalance[]> {
    return this.http.get<KidOutstandingBalance[]>(`${this.apiUrl}/outstanding-balances`);
  }

  getPaymentSummary(start: string, end: string): Observable<PaymentSummaryDTO> {
  return this.http.get<PaymentSummaryDTO>(`${this.apiUrl}/summary`, {
    params: { start, end }
  }).pipe(catchError(this.handleError));
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
