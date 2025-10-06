import { FeeInvoice } from "./fee-invoice";
import { Kid } from "./kid";

export interface Payment {
  paymentId: number;
  kid: Kid;
  feeInvoice?: FeeInvoice;
  amount: number;
  paymentDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}
