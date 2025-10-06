import { Kid } from "./kid";

export interface Progress {
  progressId: number;
  kid: Kid;
  date: string;
  goalsScored?: number;
  assists?: number;
  coachNotes?: string;
  createdAt: string;
}
