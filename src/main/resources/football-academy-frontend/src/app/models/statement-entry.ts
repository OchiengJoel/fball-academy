import { Statement } from "./statement";

export interface StatementEntry {
  entryId: number;
  statement: Statement;
  date: string;
  type: 'INVOICE' | 'PAYMENT';
  amount: number;
  balance: number;
}