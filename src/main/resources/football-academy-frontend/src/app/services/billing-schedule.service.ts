import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BillingSchedule } from '../models/billing-schedule';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillingScheduleService {

  private apiUrl = 'http://localhost:8082/api/billing-schedules';
    constructor(private http: HttpClient) {}

    createBillingSchedule(billingSchedule: BillingSchedule): Observable<BillingSchedule> {
        return this.http.post<BillingSchedule>(this.apiUrl, billingSchedule);
    }

    getActiveBillingSchedules(date: string): Observable<BillingSchedule[]> {
        return this.http.get<BillingSchedule[]>(`${this.apiUrl}/active`, { params: { date } });
    }

    exportBillingSchedules(kidId: number, format: 'pdf' | 'excel'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/${kidId}`, {
            params: { format },
            responseType: 'blob'
        });
    }

    toggleBlockSchedule(billingScheduleId: number, block: boolean): Observable<void> {
        const endpoint = block ? 'block' : 'unblock';
        return this.http.put<void>(`${this.apiUrl}/${endpoint}/${billingScheduleId}`, {});
    }
}
