export interface InvoiceSummaryDTO {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  openCount: number;
  paidCount: number;
  overdueCount: number;
  partiallyPaidCount: number;
}