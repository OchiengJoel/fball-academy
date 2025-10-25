import { ItemType } from "../components/enums/item-type.enum";

// export interface BillingSchedulePeriod {
//   from: string;
//   to: string;
//   total: number;
//   hasInvoice: boolean;
//   invoiceIds?: number[];
//   blocked: boolean;
//   items: {
//     [key in keyof typeof ItemType]?: {
//       billingScheduleId: number;
//       description: string;
//       quantity: number;
//       unitCost: number;
//       vatAmount: number | null;
//       amount: number;
//     };
//   };
// }

export interface BillingSchedulePeriod {
    billingScheduleId: number;
    periodStart: string;
    periodEnd: string;
    amount: number;
    description: string;
    hasInvoice: boolean;
    blocked: boolean;
    invoiceId?: number;
}