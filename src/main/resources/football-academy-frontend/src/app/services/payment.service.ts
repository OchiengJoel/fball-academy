import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Payment } from '../models/payment';
import { Observable } from 'rxjs';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:8082/api/payments';

  constructor(private http: HttpClient) { }

  // recordPayment(payment: Payment, invoiceId?: number): Observable<Payment> {
  //   return this.http.post<Payment>(this.apiUrl, payment, { params: { invoiceId } });
  // }

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
}
