import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BulkNotificationRequest } from '../models/bulk-notification-request';
import { AppNotification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8082/api/notifications';

  constructor(private http: HttpClient) {}

  sendNotification(notification: AppNotification): Observable<void> {
    return this.http.post<void>(this.apiUrl, notification);
  }

  sendBulkNotification(request: BulkNotificationRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk`, request);
  }
}
