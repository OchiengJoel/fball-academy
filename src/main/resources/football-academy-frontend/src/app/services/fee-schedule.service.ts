import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeeSchedule } from '../models/fee-schedule';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeeScheduleService {

  private apiUrl = 'http://localhost:8082/api/fee-schedules';

  constructor(private http: HttpClient) {}

  createFeeSchedule(feeSchedule: FeeSchedule): Observable<FeeSchedule> {
    return this.http.post<FeeSchedule>(this.apiUrl, feeSchedule);
  }

  getActiveFeeSchedules(date: string): Observable<FeeSchedule[]> {
    return this.http.get<FeeSchedule[]>(`${this.apiUrl}/active`, { params: { date } });
  }

  exportFeeSchedules(kidId: number, format: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${kidId}`, {
      params: { format },
      responseType: 'blob'
    });
  }
}
