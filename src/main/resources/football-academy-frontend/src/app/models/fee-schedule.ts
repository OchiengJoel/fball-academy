export interface FeeSchedule {
  feeScheduleId: number;
  description: string;
  amount: number;
  type: 'ONE_OFF' | 'RECURRING';
  recurrenceInterval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}