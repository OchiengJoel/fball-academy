import { ItemType } from "../components/enums/item-type.enum";

export interface InvoiceItem {
    invoiceItemId: number;
    invoiceId: number;
    billingScheduleId?: number;
    itemTypeId: number;
    itemTypeName: string;
    description: string;
    quantity: number;
    unitCost: number;
    amount: number;
    vatAmount?: number;
}

