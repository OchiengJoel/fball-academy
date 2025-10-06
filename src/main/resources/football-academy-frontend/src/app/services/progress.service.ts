import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Progress } from '../models/progress';
import { Observable } from 'rxjs';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  private apiUrl = 'http://localhost:8082/api/progress';

  constructor(private http: HttpClient) {}

  addProgress(progress: Progress): Observable<Progress> {
    return this.http.post<Progress>(this.apiUrl, progress);
  }

  getProgressForKid(kidId: number, start: string, end: string, page: number, size: number): Observable<Page<Progress>> {
    return this.http.get<Page<Progress>>(`${this.apiUrl}/kid/${kidId}`, {
      params: { start, end, page: page.toString(), size: size.toString() },
    });
  }
}
