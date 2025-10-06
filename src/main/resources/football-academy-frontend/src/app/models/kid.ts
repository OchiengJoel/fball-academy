import { User } from "./user";

export interface Kid {
  kidId: number;
  code: string;
  parent: User;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}