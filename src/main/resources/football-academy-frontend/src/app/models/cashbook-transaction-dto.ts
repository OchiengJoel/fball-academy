export interface CashbookTransactionDTO {
  transactionId: number;
  cashbookId: number;
  amount: number;
  type: 'IN' | 'OUT';
  description: string;
  transactionDate: string;
  paymentId?: number;
}