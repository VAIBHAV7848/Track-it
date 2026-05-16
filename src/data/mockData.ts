import type {
  AppData,
  AuthUser,
  FastingSession,
  HealthSnapshot,
  HydrationLog,
  MealLog,
  Recipe,
  SavedMeal,
  UserProfile,
  WeeklyInsight,
  WeightLog,
} from '@/types';
import { nowMinusHours, toIsoDate } from '@/utils/dates';
import { targetForGoal } from '@/utils/nutrition';

export const demoUser: AuthUser = {
  id: 'personal-user',
  name: 'Vaibhav',
  email: 'vaibhav@example.com',
};

export const createDefaultProfile = (user: AuthUser): UserProfile => ({
  userId: user.id,
  name: user.name,
  email: user.email,
  age: 21,
  gender: 'male',
  heightCm: 175,
  weightKg: 70,
  targetWeightKg: 67,
  goal: 'muscle-gain',
  dietPreference: 'non-vegetarian',
  allergies: ['milk'],
  activityLevel: 'moderate',
  reminders: {
    meals: true,
    water: true,
    fasting: true,
    protein: true,
    weeklySummary: true,
  },
  googleFitConnected: false,
  aiAnalysisEnabled: true,
  photoSavingEnabled: false,
});

const todayAt = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const seedMeals = (): MealLog[] => [
  {
    id: 'meal-breakfast',
    name: 'Egg bhurji with toast',
    type: 'breakfast',
    quantity: '2 eggs, 2 bread slices',
    source: 'voice',
    createdAt: todayAt(9, 10),
    calories: 430,
    protein: 26,
    carbs: 38,
    fat: 19,
    fiber: 5,
    sugar: 4,
    sodium: 620,
    allergens: ['egg', 'gluten'],
    confidence: 'medium',
    verdict: 'Strong breakfast; add fruit for fiber',
    cost: 55,
    mood: 'focused',
    gutReaction: 'normal',
  },
  {
    id: 'meal-lunch',
    name: 'Dal rice and curd',
    type: 'lunch',
    quantity: '1.5 cups rice, 1 cup dal, 1 bowl curd',
    source: 'saved',
    createdAt: todayAt(13, 35),
    calories: 620,
    protein: 22,
    carbs: 92,
    fat: 14,
    fiber: 8,
    sugar: 6,
    sodium: 810,
    allergens: ['milk'],
    confidence: 'high',
    verdict: 'Good meal; protein is slightly low',
    cost: 80,
    mood: 'sleepy',
    gutReaction: 'slight bloating',
    isFavorite: true,
  },
];

export const seedSavedMeals: SavedMeal[] = [
  {
    id: 'saved-shake',
    name: 'My protein shake',
    defaultServing: '1 glass',
    calories: 350,
    protein: 32,
    carbs: 28,
    fat: 8,
    fiber: 4,
    sugar: 9,
    sodium: 180,
    tags: ['quick', 'post-workout'],
  },
  {
    id: 'saved-poha',
    name: "Mom's poha",
    defaultServing: '1 plate',
    calories: 390,
    protein: 11,
    carbs: 62,
    fat: 12,
    fiber: 6,
    sugar: 5,
    sodium: 560,
    tags: ['home', 'breakfast'],
  },
  {
    id: 'saved-curry',
    name: 'Hostel chicken curry',
    defaultServing: '1 bowl',
    calories: 480,
    protein: 35,
    carbs: 18,
    fat: 28,
    fiber: 3,
    sugar: 4,
    sodium: 920,
    tags: ['high-protein', 'outside'],
  },
];

export const seedRecipes: Recipe[] = [
  {
    id: 'recipe-egg-toast',
    title: 'Masala egg toast',
    ingredients: ['eggs', 'bread', 'onion', 'green chilli', 'curd dip'],
    steps: [
      'Whisk eggs with onion, chilli, salt, and coriander.',
      'Dip bread, toast on a pan with minimal oil.',
      'Serve with curd dip and cucumber.',
    ],
    calories: 420,
    protein: 24,
    cookingTimeMinutes: 15,
    difficulty: 'easy',
    goalTag: 'quick high-protein',
    budget: 'low',
    saved: true,
    rating: 5,
  },
  {
    id: 'recipe-leftover-rice',
    title: 'Leftover rice paneer bowl',
    ingredients: ['leftover rice', 'paneer', 'capsicum', 'curd', 'spices'],
    steps: [
      'Toss capsicum and paneer with spices.',
      'Warm rice and fold in paneer mix.',
      'Finish with curd and lemon.',
    ],
    calories: 560,
    protein: 31,
    cookingTimeMinutes: 18,
    difficulty: 'easy',
    goalTag: 'muscle gain',
    budget: 'medium',
    saved: false,
  },
];

export const seedFastingSessions = (): FastingSession[] => [
  {
    id: 'fast-active',
    plan: '16:8',
    startTime: nowMinusHours(10),
    hungerLevel: 3,
    energy: 'medium',
    mood: 'focused',
  },
  {
    id: 'fast-yesterday',
    plan: '14:10',
    startTime: nowMinusHours(34),
    endTime: nowMinusHours(19),
    hungerLevel: 2,
    energy: 'high',
    mood: 'calm',
  },
];

export const seedHydrationLogs = (): HydrationLog[] => [
  { id: 'water-1', amountMl: 500, createdAt: todayAt(8, 45) },
  { id: 'water-2', amountMl: 250, createdAt: todayAt(11, 15) },
  { id: 'water-3', amountMl: 500, createdAt: todayAt(15, 5) },
];

export const seedWeightLogs = (): WeightLog[] => [
  { id: 'weight-1', weightKg: 70.8, date: toIsoDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 21)) },
  { id: 'weight-2', weightKg: 70.4, date: toIsoDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)) },
  { id: 'weight-3', weightKg: 70.1, date: toIsoDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)) },
  { id: 'weight-4', weightKg: 69.9, date: toIsoDate() },
];

export const seedHealth: HealthSnapshot = {
  steps: 6840,
  activeMinutes: 42,
  caloriesBurned: 410,
  heartRate: 72,
  sleepHours: 6.4,
  lastSyncedAt: new Date().toISOString(),
};

export const seedInsights: WeeklyInsight[] = [
  {
    id: 'insight-protein',
    title: 'Protein is close but lunch is weak',
    body: 'Breakfast is doing the work. Add 20g protein to lunch on low-workout days.',
    severity: 'watch',
  },
  {
    id: 'insight-water',
    title: 'Hydration dips after 4 PM',
    body: 'Most water logs happen before lunch. A 500ml reminder after classes would help.',
    severity: 'neutral',
  },
  {
    id: 'insight-mood',
    title: 'High-carb lunches correlate with sleepiness',
    body: 'Two logged sleepy moods came after rice-heavy lunches. Add dal, curd, eggs, or chicken first.',
    severity: 'watch',
  },
];

export const createSeedData = (user = demoUser): AppData => {
  const profile = createDefaultProfile(user);
  return {
    profile,
    targets: targetForGoal(profile.goal, profile.weightKg),
    meals: seedMeals(),
    savedMeals: seedSavedMeals,
    recipes: seedRecipes,
    fastingSessions: seedFastingSessions(),
    hydrationLogs: seedHydrationLogs(),
    weightLogs: seedWeightLogs(),
    health: seedHealth,
    insights: seedInsights,
  };
};
