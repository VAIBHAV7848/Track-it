import type { HealthSnapshot } from '@/types';

export const syncHealthConnect = async (): Promise<HealthSnapshot> => {
  // Production adapter target:
  // Use Android Health Connect permissions for steps, active minutes,
  // workouts, sleep, heart rate, and calories burned.
  return {
    steps: 7380,
    activeMinutes: 51,
    caloriesBurned: 465,
    heartRate: 74,
    sleepHours: 6.8,
    lastSyncedAt: new Date().toISOString(),
  };
};
