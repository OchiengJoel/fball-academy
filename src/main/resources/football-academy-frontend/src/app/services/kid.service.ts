import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KidRequest } from '../models/kid-request';
import { Kid } from '../models/kid';

@Injectable({
  providedIn: 'root'
})
export class KidService {

  private apiUrl = 'http://localhost:8082/api/kids';

  constructor(private http: HttpClient) { }

  addKid(kidRequest: KidRequest): Observable<Kid> {
    return this.http.post<Kid>(this.apiUrl, kidRequest);
  }

  // getKidsByParent(parentId: number, status?: string): Observable<Kid[]> {
  //   return this.http.get<Kid[]>(`${this.apiUrl}/parent/${parentId}`, { params: { status } });
  // }

  getKidsByParent(parentId: number, status?: string): Observable<Kid[]> {
    const params: { [key: string]: string } = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get<Kid[]>(`${this.apiUrl}/parent/${parentId}`, { params });
  }

  updateKidStatus(kidId: number, status: string): Observable<Kid> {
    return this.http.put<Kid>(`${this.apiUrl}/${kidId}/status`, { status });
  }
}
