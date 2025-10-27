export interface InvoiceItemAllocationDTO {
  invoiceItemId: number;
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  invoiceItemAmount: number;
  paidAmount: number;
  amountDue: number;
  allocationAmount: number;
  balance: number;
}