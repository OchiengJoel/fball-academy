import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CashbookDTO } from '../models/cashbook-dto';
import { CashbookTransactionDTO } from '../models/cashbook-transaction-dto';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class CashbookService {
  private apiUrl = 'http://localhost:8082/api/cashbooks';

  constructor(private http: HttpClient) {}

  createCashbook(cashbook: CashbookDTO): Observable<CashbookDTO> {
    return this.http.post<CashbookDTO>(this.apiUrl, cashbook);
  }

  getAllCashbooks(): Observable<CashbookDTO[]> {
    return this.http.get<CashbookDTO[]>(this.apiUrl);
  }

  getCashbook(id: number): Observable<CashbookDTO> {
    return this.http.get<CashbookDTO>(`${this.apiUrl}/${id}`);
  }

  updateCashbook(id: number, cashbook: CashbookDTO): Observable<CashbookDTO> {
    return this.http.put<CashbookDTO>(`${this.apiUrl}/${id}`, cashbook);
  }

  deleteCashbook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCashbookTransactions(id: number, start: string, end: string, page: number, size: number): Observable<Page<CashbookTransactionDTO>> {
    return this.http.get<Page<CashbookTransactionDTO>>(`${this.apiUrl}/${id}/transactions`, {
      params: { start, end, page: page.toString(), size: size.toString() }
    });
  }

  getAllCashbookTransactions(start: string, end: string, page: number, size: number): Observable<Page<CashbookTransactionDTO>> {
    return this.http.get<Page<CashbookTransactionDTO>>(`${this.apiUrl}/transactions`, {
      params: { start, end, page: page.toString(), size: size.toString() }
    });
  }
}