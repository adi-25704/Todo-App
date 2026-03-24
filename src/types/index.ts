export type itemStatus = "Pending" | "Completed" | " Overdue";
export type subCycle =  "Monthly"| "Yearly" | "Weekly";
export type ItemType = 'task' | 'subscription';
interface BaseItem{
    id: string;
    title: string;
    description: string;
    category: string;
    reminders: Date[];
    taskStatus: itemStatus;
    createdAt: Date;

}

export interface Task extends BaseItem
{
    type: "task";
    dueDate: Date;
}

export interface Subscription extends BaseItem{
    type: "subscription";
    endDate: Date;
    startDate: Date;
    prevBillingDate: Date;
    nextBillingDate: Date;
    amount: number;
    billingCycle: subCycle;
    autoRenew: boolean;
}

export type AppItem = Task | Subscription;