export interface KidOutstandingBalance {

    kidId: number;
    kidName: string; // Added to match DTO
    firstName: string;
    lastName: string;
    outstandingBalance: number;
    within30Days: number;
    within60Days: number;
    within90Days: number;
    within120Days: number;
    over120Days: number;
}
