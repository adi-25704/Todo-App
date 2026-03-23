// import { db } from '../db';
// import type { AppItem, Task, Subscription } from '../types';

// export const addTask = async (title: string, dueDate: Date) => {
//   const newTask: Task = {
//     id: crypto.randomUUID(), // Generates a unique string ID
//     type: 'task',
//     title: title,
//     description: '',
//     category: 'General',
//     reminders: [],
//     status: 'Pending',
//     createdAt: new Date(),
//     dueDate: dueDate,
//   };

//   try {
//     await db.items.add(newTask);
//     console.log('Task added successfully!');
//   } catch (error) {
//     console.error('Failed to add task:', error);
//   }
// };