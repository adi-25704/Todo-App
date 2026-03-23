export type itemStatus = "Pending" | "Completed" | " Archived";
export type subCycle =  "Daily" | "Monthly"| "Yearly" | "Weekly";
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
    dueDate: Date
}

export interface Subscription extends BaseItem{
    type: "subscription";
    endDate: Date;
    startDate: Date;
    amount: number;
    billingCycle: subCycle;
    autoRenew: boolean;
}

export type AppItem = Task | Subscription;


// export type ItemType = 'task' | 'subscription';

// export interface BaseItem {
//   id: string;
//   title: string;
//   dueDate: Date;
//   createdAt: Date;
// }

// export interface Task extends BaseItem {
//   type: 'task';
//   completed: boolean;
// }

// export interface Subscription extends BaseItem {
//   type: 'subscription';
//   amount: number;
//   icon: string;
// }

// export type AppItem = Task | Subscription;

