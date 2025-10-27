import { CashbookDTO } from "./cashbook-dto";
import { FeeInvoice } from "./fee-invoice";
import { Kid } from "./kid";

export interface Payment {
  paymentId: number;
  kid: Kid;
  amount: number;
  paymentDate: string;
  bankingDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  transactionId?: string;
  cashbook: CashbookDTO;
  overpaymentAmount: number;
  createdAt: string;
  updatedAt: string;
}