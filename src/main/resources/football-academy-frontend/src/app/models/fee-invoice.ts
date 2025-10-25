import { FeeSchedule } from "./fee-schedule";
import { InvoiceItem } from "./invoice-item";
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
    invoiceNumber: string;
    kidId?: number;
    kidName?: string;
    clientName?: string;
    amount: number;
    dueDate: string;
    status: 'OPEN' | 'PAID' | 'OVERDUE';
    createdAt: string;
    updatedAt: string;
    items: InvoiceItem[];
}
