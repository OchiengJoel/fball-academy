import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeeInvoice } from '../models/fee-invoice';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeeInvoiceService {

  private apiUrl = 'http://localhost:8082/api/fee-invoices';

  constructor(private http: HttpClient) {}

  createInvoice(kidId: number, feeScheduleId: number, dueDate: string): Observable<FeeInvoice> {
    return this.http.post<FeeInvoice>(this.apiUrl, null, { params: { kidId, feeScheduleId, dueDate } });
  }

  getInvoicesForKid(kidId: number, start: string, end: string): Observable<FeeInvoice[]> {
    return this.http.get<FeeInvoice[]>(`${this.apiUrl}/kid/${kidId}`, { params: { start, end } });
  }

  getOutstandingBalance(kidId: number, start: string, end: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/balance/${kidId}`, { params: { start, end } });
  }
}
