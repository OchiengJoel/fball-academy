import { InvoiceItemRequest } from "./invoice-item-request";

export interface ManualInvoiceRequest {
    kidId?: number;
    clientName?: string;
    dueDate: string;
    items: InvoiceItemRequest[];
}
