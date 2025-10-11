export interface KidRequest {
  parentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  enrollmentDate: string;
  feeDetails: FeeDetail[];
}


export interface FeeDetail {
    feeScheduleId: number;
    amount: number;
    chargeType: 'ONE_OFF' | 'RECURRING';
    recurrenceInterval?: string;
    prorate: boolean;
    dueDate?: string; // New field for one-off due date
}
