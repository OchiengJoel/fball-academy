export interface PaymentSummaryDTO {
  totalPayments: number;
  totalAmount: number;
  totalOverpayment: number;
  byMethod: Record<string, number>;
  byMonth: Record<string, number>;
}