export type Goal =
  | 'cut'
  | 'bulk'
  | 'maintain'
  | 'fat-loss'
  | 'muscle-gain'
  | 'digestion'
  | 'energy'
  | 'skin-hair'
  | 'healthy';

export type DietPreference =
  | 'vegetarian'
  | 'non-vegetarian'
  | 'eggetarian'
  | 'vegan'
  | 'jain'
  | 'custom';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Confidence = 'high' | 'medium' | 'low';
export type EnergyLevel = 'low' | 'medium' | 'high';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
};

export type ReminderPreferences = {
  meals: boolean;
  water: boolean;
  fasting: boolean;
  protein: boolean;
  weeklySummary: boolean;
};

export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: Goal;
  dietPreference: DietPreference;
  allergies: string[];
  activityLevel: 'low' | 'moderate' | 'high';
  reminders: ReminderPreferences;
  googleFitConnected: boolean;
  aiAnalysisEnabled: boolean;
  photoSavingEnabled: boolean;
};

export type MacroSummary = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

export type NutritionTargets = MacroSummary & {
  waterMl: number;
};

export type MealLog = MacroSummary & {
  id: string;
  name: string;
  type: MealType;
  quantity: string;
  source: 'manual' | 'scan' | 'voice' | 'saved';
  createdAt: string;
  cost?: number;
  mood?: string;
  gutReaction?: string;
  allergens: string[];
  confidence: Confidence;
  verdict: string;
  photoUri?: string;
  isFavorite?: boolean;
  isOutsideFood?: boolean;
};

export type SavedMeal = MacroSummary & {
  id: string;
  name: string;
  defaultServing: string;
  tags: string[];
};

export type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  protein: number;
  cookingTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  goalTag: string;
  budget: 'low' | 'medium' | 'high';
  saved: boolean;
  rating?: number;
};

export type FastingSession = {
  id: string;
  plan: string;
  startTime: string;
  endTime?: string;
  mood?: string;
  hungerLevel?: number;
  energy?: EnergyLevel;
  notes?: string;
};

export type HydrationLog = {
  id: string;
  amountMl: number;
  createdAt: string;
};

export type WeightLog = {
  id: string;
  weightKg: number;
  date: string;
};

export type HealthSnapshot = {
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  heartRate?: number;
  sleepHours?: number;
  lastSyncedAt?: string;
};

export type WeeklyInsight = {
  id: string;
  title: string;
  body: string;
  severity: 'positive' | 'watch' | 'neutral';
};

export type AppData = {
  profile: UserProfile;
  targets: NutritionTargets;
  meals: MealLog[];
  savedMeals: SavedMeal[];
  recipes: Recipe[];
  fastingSessions: FastingSession[];
  hydrationLogs: HydrationLog[];
  weightLogs: WeightLog[];
  health: HealthSnapshot;
  insights: WeeklyInsight[];
};
