import { FeeSchedule } from "./fee-schedule";
import { Kid } from "./kid";

// export interface FeeInvoice {
//   invoiceId: number;
//   kid: Kid;
//   feeSchedule: FeeSchedule;
//   amount: number;
//   dueDate: string;
//   status: 'OPEN' | 'PAID' | 'OVERDUE';
//   createdAt: string;
//   updatedAt: string;
// }

export interface FeeInvoice {
  invoiceId: number;
  kidId: number;
  kidName: string;
  billingScheduleId: number;
  billingScheduleDescription: string;
  amount: number;
  dueDate: string;
  status: 'OPEN' | 'PAID' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}
