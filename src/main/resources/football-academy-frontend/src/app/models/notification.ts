import { User } from "./user";

export interface AppNotification {
  notificationId: number;
  user: User;
  type: 'PAYMENT_REMINDER' | 'ANNOUNCEMENT';
  message: string;
  channel: 'SMS' | 'EMAIL' | 'IN_APP';
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  createdAt: string;
}
