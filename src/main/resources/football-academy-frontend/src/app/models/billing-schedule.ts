import { FeeSchedule } from "./fee-schedule";
import { Kid } from "./kid";

export interface BillingSchedule {
    billingScheduleId: number;
    kidId: number;
    kidName: string;
    description: string;
    amount: number;
    type: 'ONE_OFF' | 'RECURRING';
    recurrenceInterval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
    startDate?: string;
    endDate?: string;
    dueDate: string;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
}

