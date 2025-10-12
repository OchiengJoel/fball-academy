import { FeeSchedule } from "./fee-schedule";
import { Kid } from "./kid";

export interface BillingSchedule {
    billingScheduleId: number;
    kidId: number;
    kidName: string;
    feeScheduleId: number;
    feeScheduleDescription: string;
    amount: number;
    dueDate: string;
    recurrenceInterval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY' | 'ANNUALLY';
    createdAt: string;
    updatedAt: string;
}

