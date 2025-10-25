import { ItemType } from "../components/enums/item-type.enum";

export interface KidRequest {
  parentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  enrollmentDate: string;
  feeDetails: FeeDetail[];
}


export interface FeeDetail {
  description: string;
  amount: number;
  chargeType: 'ONE_OFF' | 'RECURRING';
  itemType: keyof typeof ItemType;
  recurrenceInterval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY' | 'ONE_TIME';
  prorate: boolean;
  dueDate?: string;
}
