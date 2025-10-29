import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KidRequest } from '../models/kid-request';
import { Kid, KidBalance } from '../models/kid';

@Injectable({
  providedIn: 'root'
})
export class KidService {
  private apiUrl = 'http://localhost:8082/api/kids';

  constructor(private http: HttpClient) {}

  addKid(kidRequest: KidRequest): Observable<Kid> {
    return this.http.post<Kid>(this.apiUrl, kidRequest);
  }

  updateKid(kidId: number, kidRequest: KidRequest): Observable<Kid> {
    return this.http.put<Kid>(`${this.apiUrl}/${kidId}`, kidRequest);
  }

  getAllKids(status?: string): Observable<Kid[]> {
    const params: { [key: string]: string } = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get<Kid[]>(this.apiUrl, { params });
  }

  getKidById(kidId: number): Observable<Kid> {
    return this.http.get<Kid>(`${this.apiUrl}/${kidId}`);
  }

  getKidByCode(code: string): Observable<Kid> {
    return this.http.get<Kid>(`${this.apiUrl}/code/${code}`);
  }

  getKidsByParent(parentId: number, status?: string): Observable<Kid[]> {
    const params: { [key: string]: string } = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get<Kid[]>(`${this.apiUrl}/parent/${parentId}`, { params });
  }

  searchKids(criteria: { firstName?: string; lastName?: string; status?: string; parentName?: string }): Observable<Kid[]> {
    return this.http.get<Kid[]>(`${this.apiUrl}/search`, { params: criteria });
  }

  updateKidStatus(kidId: number, status: string): Observable<Kid> {
    return this.http.put<Kid>(`${this.apiUrl}/${kidId}/status`, { status });
  }

  deleteKid(kidId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${kidId}`);
  }

}
