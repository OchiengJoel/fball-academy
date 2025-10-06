import { Component, OnInit } from '@angular/core';
import { BulkNotificationRequest } from 'src/app/models/bulk-notification-request';
import { AppNotification } from 'src/app/models/notification';
import { User } from 'src/app/models/user';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit{
  
  notification: AppNotification = {
    notificationId: 0,
    user: { userId: 0 } as User,
    type: 'ANNOUNCEMENT',
    message: '',
    channel: 'SMS',
    status: 'PENDING',
    createdAt: '',
  };
  bulkRequest: BulkNotificationRequest = { userIds: [], message: '' };
  users: User[] = [];
  user: User | null = null;

  constructor(
    private notificationService: NotificationService, 
    private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserByEmail(localStorage.getItem('email') || '').subscribe({
      next: (user) => {
        this.user = user;
        // Fetch users (for admin to select recipients)
        this.userService.getUserByEmail('').subscribe({
          // This assumes an endpoint to get all users; you may need to add one
          next: (users) => (this.users = [user]), // Placeholder; replace with actual user list fetch
        });
      },
    });
  }

  sendNotification() {
    this.notificationService.sendNotification(this.notification).subscribe({
      next: () => alert('Notification sent successfully'),
    });
  }

  sendBulkNotification() {
    this.notificationService.sendBulkNotification(this.bulkRequest).subscribe({
      next: () => alert('Bulk notification sent successfully'),
    });
  }

}
