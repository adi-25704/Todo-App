import type { subCycle } from "../types";

export const getDaysUntil = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateNextBillingDate = (currentBillingDate: Date, cycle: subCycle): Date => {
  const nextDate = new Date(currentBillingDate);
  const dayOfMonth = currentBillingDate.getDate();

  if (cycle === 'Monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    if (nextDate.getDate() !== dayOfMonth) {
      nextDate.setDate(0);
    }
  } else if (cycle === 'Yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    if (nextDate.getDate() !== dayOfMonth) {
      nextDate.setDate(0);
    }
  } else if (cycle === 'Weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
};