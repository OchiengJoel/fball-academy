
export interface InvoiceItemRequest {
    billingScheduleId?: number; // Optional for manual invoices
    itemTypeId: number;
    description: string;
    quantity: number;
    unitCost: number;
    vatAmount?: number;
}
