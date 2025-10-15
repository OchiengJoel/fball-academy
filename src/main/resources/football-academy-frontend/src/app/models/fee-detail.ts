export interface FeeDetail {
    description: string;
    amount: number;
    chargeType: 'ONE_OFF' | 'RECURRING';
    recurrenceInterval?: string;
    prorate: boolean;
    dueDate?: string;
    startDate?: string;
    endDate?: string;
}