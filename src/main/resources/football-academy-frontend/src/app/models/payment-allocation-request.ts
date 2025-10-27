import { InvoiceItemAllocation } from "./invoice-item-allocation";


export interface PaymentAllocationRequest {
  kidId: number;
  amount: number;
  paymentDate: string; // Format: YYYY-MM-DD'T'HH:mm:ss
  bankingDate?: string; // Format: YYYY-MM-DD
  transactionId?: string;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  cashbookId: number;
  allocations: InvoiceItemAllocation[];
}

