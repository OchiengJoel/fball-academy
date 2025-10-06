import { Kid } from "./kid";
import { StatementEntry } from "./statement-entry";

export interface Statement {
  statementId: number;
  kid: Kid;
  periodStart: string;
  periodEnd: string;
  totalDue: number;
  totalPaid: number;
  status: 'OPEN' | 'CLOSED';
  generatedAt: string;
  pdfUrl?: string;
  entries: StatementEntry[];
}