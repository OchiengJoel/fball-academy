import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../models/login-request';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { PasswordResetRequest } from '../models/password-reset-request';
import { PasswordResetConfirmRequest } from '../models/password-reset-confirm-request';
import { User } from '../models/user';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8082/api/auth';
  private userApiUrl = 'http://localhost:8082/api/users';
  private cachedUser: User | null = null;

  constructor(
    private http: HttpClient,
    private userStateService: UserStateService
  
  ) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.storeTokens(response);
        localStorage.setItem('email', request.email); // Save email
        this.loadUser(request.email); // Load user immediately
      })
    );
  }

  private loadUser(email: string): void {
  this.http.get<User>(`${this.userApiUrl}/${email}`).subscribe({
    next: (user) => {
      this.userStateService.setUser(user); // Notify all components
      localStorage.setItem('user', JSON.stringify(user));
    },
    error: (err) => {
      console.error('Failed to load user:', err);
      this.userStateService.setUser(null);
    }
  });
}

  getCurrentUser(email: string): Observable<User> {
    // Check if user is cached
    if (this.cachedUser && this.cachedUser.email === email) {
      return of(this.cachedUser);
    }
    return this.http.get<User>(`${this.userApiUrl}/${email}`).pipe(
      tap(user => {
        this.cachedUser = user;
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(err => {
        console.error('Failed to fetch user:', err);
        throw err;
      })
    );
  }

  loadCachedUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.cachedUser = JSON.parse(userJson);
      return this.cachedUser;
    }
    return null;
  }

  verifyLoginToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-login-token`, null, { params: { token } });
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => this.storeTokens(response))
    );
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/password-reset/request`, request);
  }

  resetPassword(request: PasswordResetConfirmRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/password-reset`, request);
  }

  storeTokens(authResponse: AuthResponse): void {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    this.cachedUser = null;
  }
}
