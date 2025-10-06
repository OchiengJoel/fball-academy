import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Statement } from '../models/statement';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatementService {

  private apiUrl = 'http://localhost:8082/api/statements';

  constructor(private http: HttpClient) {}

  generateStatement(kidId: number, periodStart: string, periodEnd: string, includeDetails: boolean): Observable<Statement> {
    return this.http.post<Statement>(`${this.apiUrl}/generate`, null, {
      params: { kidId, periodStart, periodEnd, includeDetails },
    });
  }

  exportStatement(kidId: number, periodStart: string, periodEnd: string, includeDetails: boolean, format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${kidId}`, {
      params: { periodStart, periodEnd, includeDetails: includeDetails.toString(), format },
      responseType: 'blob'
    });
  }

  exportProfileSummary(kidId: number, format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/profile-summary/${kidId}`, {
      params: { format },
      responseType: 'blob'
    });
  }
}
