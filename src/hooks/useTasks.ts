import { db } from '../db';
import type { itemStatus, subCycle, Subscription, Task } from '../types';




export const useTasks = () => {
  const addTask = async (title: string, dueDate: Date, description: string, category: string, reminders: Date[], taskStatus: itemStatus) => {
    const item: Task = {
      id: crypto.randomUUID(),
      type: "task",
      title,
      dueDate,
      description,
      category,
      reminders,
      taskStatus,
      createdAt: new Date()
    };
    const response = await db.items.add(item);
    return response;
  }

  const addSubscription = async (title: string, startDate: Date, endDate: Date,
                          description: string, category: string, 
                          reminders: Date[], taskStatus: itemStatus,
                          billingCycle: subCycle, amount: number,
                         autoRenew: boolean) => {

    const item : Subscription = {
      id: crypto.randomUUID(),
      type: "subscription",
      title,
      startDate,
      endDate,
      description,
      category,
      reminders,
      taskStatus,
      createdAt: new Date(),
      amount,
      billingCycle,
      autoRenew
    };
    const response = await db.items.add(item);
    return response;
  }

  const deleteItem = async (id:string)=>{
      await db.items.delete(id);
  };

  const toggleTask = async (id:string, taskStatus: itemStatus) =>{
    await db.items.update(id,{ taskStatus })
  };

  return {addTask, addSubscription, deleteItem, toggleTask}

}