export interface User {
  userId: number;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PARENT';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}
