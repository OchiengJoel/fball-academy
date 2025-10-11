import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8082/api/users';

  constructor(private http: HttpClient) {}

  // createUser(user: User, sendCredentials: boolean): Observable<User> {
  //   return this.http.post<User>(this.apiUrl, user, { params: { sendCredentials } });
  // }

  createUser(user: User, sendCredentials: boolean, customPassword?: string): Observable<User> {
    let params = new HttpParams().set('sendCredentials', sendCredentials.toString());
    if (customPassword) {
      params = params.set('customPassword', customPassword);
    }
    return this.http.post<User>(this.apiUrl, user, { params });
  }

   updateUser(userId: number, user: User, customPassword?: string): Observable<User> {
    let params = new HttpParams();
    if (customPassword) {
      params = params.set('customPassword', customPassword);
    }
    return this.http.put<User>(`${this.apiUrl}/${userId}`, user, { params });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getAllUsers(page: number = 0, size: number = 10): Observable<Page<User>> {
    return this.http.get<Page<User>>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getParentUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/parents`);
  }

  getUsersByRole(role: string, page: number = 0, size: number = 10): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${this.apiUrl}/role/${role}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  getUsersByKids(kidIds: number[]): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/by-kids`, {
      params: { kidIds: kidIds.join(',') }
    });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${email}`);
  }

  exportUsers(format: 'pdf' | 'excel', role?: string): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (role) {
      params = params.set('role', role);
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }
}
