import { FeeSchedule } from "./fee-schedule";
import { Kid } from "./kid";

export interface BillingSchedule {
    billingScheduleId: number;
    kid: Kid;
    feeSchedule: FeeSchedule;
    amount: number;
    recurrenceInterval: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
}

