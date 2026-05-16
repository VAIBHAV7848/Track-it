import type { ReminderPreferences } from '@/types';

export const buildReminderPlan = (reminders: ReminderPreferences) => {
  const plan: string[] = [];
  if (reminders.meals) {
    plan.push('Breakfast, lunch, dinner, and missed-meal reminders');
  }
  if (reminders.water) {
    plan.push('Hydration reminders every 90 minutes while awake');
  }
  if (reminders.fasting) {
    plan.push('Fast start, ending soon, and completion alerts');
  }
  if (reminders.protein) {
    plan.push('Evening protein gap reminder');
  }
  if (reminders.weeklySummary) {
    plan.push('Sunday weekly summary');
  }
  return plan;
};
