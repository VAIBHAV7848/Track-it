import { createSeedData } from '@/data/mockData';
import { supabase } from '@/services/supabase';
import type {
  AppData,
  AuthUser,
  DietPreference,
  FastingSession,
  Goal,
  HealthSnapshot,
  HydrationLog,
  MealLog,
  MealType,
  NutritionTargets,
  Recipe,
  ReminderPreferences,
  SavedMeal,
  UserProfile,
  WeeklyInsight,
  WeightLog,
} from '@/types';
import { targetForGoal } from '@/utils/nutrition';

type JsonMap = Record<string, unknown>;

type ProfileRow = {
  user_id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number | null;
  goal: string;
  diet_preference: string;
  allergies: string[] | null;
  activity_level: 'low' | 'moderate' | 'high';
  reminders: ReminderPreferences | JsonMap | null;
  google_fit_connected: boolean;
  ai_analysis_enabled: boolean;
  photo_saving_enabled: boolean;
};

type TargetRow = NutritionTargets & {
  user_id: string;
  water_ml: number;
};

type MealRow = {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: MealType;
  quantity: string;
  source: MealLog['source'];
  photo_url: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cost: number | null;
  mood: string | null;
  gut_reaction: string | null;
  allergens: string[] | null;
  confidence: MealLog['confidence'];
  verdict: string;
  is_favorite: boolean;
  is_outside_food: boolean;
  created_at: string;
};

type SavedMealRow = {
  id: string;
  user_id: string;
  name: string;
  default_serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  tags: string[] | null;
};

type RecipeRow = {
  id: string;
  user_id: string;
  title: string;
  ingredients: string[] | null;
  steps: string[] | null;
  calories: number;
  protein: number;
  cooking_time_minutes: number;
  difficulty: Recipe['difficulty'];
  goal_tag: string;
  budget: Recipe['budget'];
  saved: boolean;
  rating: number | null;
};

type FastingRow = {
  id: string;
  user_id: string;
  plan: string;
  start_time: string;
  end_time: string | null;
  mood: string | null;
  hunger_level: number | null;
  energy: FastingSession['energy'] | null;
  notes: string | null;
};

type HydrationRow = {
  id: string;
  user_id: string;
  amount_ml: number;
  created_at: string;
};

type WeightRow = {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string;
};

type HealthRow = {
  user_id: string;
  steps: number;
  active_minutes: number;
  calories_burned: number;
  heart_rate: number | null;
  sleep_hours: number | null;
  last_synced_at: string | null;
};

type InsightRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  severity: WeeklyInsight['severity'];
};

const ensureNoError = <T extends { error: { message: string } | null }>(result: T) => {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result;
};

export const createInitialAppData = (user: AuthUser, profile: UserProfile): AppData => {
  const seed = createSeedData(user);
  return {
    ...seed,
    profile,
    targets: targetForGoal(profile.goal, profile.weightKg),
  };
};

export const loadAppData = async (user: AuthUser): Promise<AppData | null> => {
  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>();
  ensureNoError(profileResult);

  if (!profileResult.data) {
    return null;
  }

  const [
    targetsResult,
    mealsResult,
    savedMealsResult,
    recipesResult,
    fastingResult,
    hydrationResult,
    weightsResult,
    healthResult,
    insightsResult,
  ] = await Promise.all([
    supabase.from('nutrition_targets').select('*').eq('user_id', user.id).maybeSingle<TargetRow>(),
    supabase.from('meals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('saved_meals').select('*').eq('user_id', user.id).order('name', { ascending: true }),
    supabase.from('recipes').select('*').eq('user_id', user.id).order('title', { ascending: true }),
    supabase.from('fasting_sessions').select('*').eq('user_id', user.id).order('start_time', { ascending: false }),
    supabase.from('hydration_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('weight_logs').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    supabase.from('health_snapshots').select('*').eq('user_id', user.id).maybeSingle<HealthRow>(),
    supabase.from('weekly_insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  [
    targetsResult,
    mealsResult,
    savedMealsResult,
    recipesResult,
    fastingResult,
    hydrationResult,
    weightsResult,
    healthResult,
    insightsResult,
  ].forEach(ensureNoError);

  const profile = mapProfile(profileResult.data);
  const seed = createSeedData(user);

  return {
    profile,
    targets: targetsResult.data ? mapTargets(targetsResult.data) : targetForGoal(profile.goal, profile.weightKg),
    meals: ((mealsResult.data ?? []) as MealRow[]).map(mapMeal),
    savedMeals: ((savedMealsResult.data ?? []) as SavedMealRow[]).map(mapSavedMeal),
    recipes: ((recipesResult.data ?? []) as RecipeRow[]).map(mapRecipe),
    fastingSessions: ((fastingResult.data ?? []) as FastingRow[]).map(mapFastingSession),
    hydrationLogs: ((hydrationResult.data ?? []) as HydrationRow[]).map(mapHydrationLog),
    weightLogs: ((weightsResult.data ?? []) as WeightRow[]).map(mapWeightLog),
    health: healthResult.data ? mapHealth(healthResult.data) : seed.health,
    insights: ((insightsResult.data ?? []) as InsightRow[]).map(mapInsight),
  };
};

export const saveAppData = async (data: AppData) => {
  const operations = [
    supabase.from('profiles').upsert(profileToRow(data.profile), { onConflict: 'user_id' }),
    supabase.from('nutrition_targets').upsert(targetsToRow(data.profile.userId, data.targets), {
      onConflict: 'user_id',
    }),
    supabase.from('health_snapshots').upsert(healthToRow(data.profile.userId, data.health), {
      onConflict: 'user_id',
    }),
  ];

  const baseResults = await Promise.all(operations);
  baseResults.forEach(ensureNoError);

  await Promise.all([
    upsertMany('meals', data.meals.map((meal) => mealToRow(data.profile.userId, meal))),
    upsertMany(
      'saved_meals',
      data.savedMeals.map((meal) => savedMealToRow(data.profile.userId, meal)),
    ),
    upsertMany(
      'recipes',
      data.recipes.map((recipe) => recipeToRow(data.profile.userId, recipe)),
    ),
    upsertMany(
      'fasting_sessions',
      data.fastingSessions.map((session) => fastingToRow(data.profile.userId, session)),
    ),
    upsertMany(
      'hydration_logs',
      data.hydrationLogs.map((log) => hydrationToRow(data.profile.userId, log)),
    ),
    upsertMany(
      'weight_logs',
      data.weightLogs.map((log) => weightToRow(data.profile.userId, log)),
      'user_id,date',
    ),
    upsertMany(
      'weekly_insights',
      data.insights.map((insight) => insightToRow(data.profile.userId, insight)),
    ),
  ]);
};

export const deleteRemoteUserData = async (userId: string) => {
  const tables = [
    'weekly_insights',
    'health_snapshots',
    'weight_logs',
    'hydration_logs',
    'fasting_sessions',
    'recipes',
    'saved_meals',
    'meals',
    'nutrition_targets',
    'profiles',
  ];

  const results = await Promise.all(tables.map((table) => supabase.from(table).delete().eq('user_id', userId)));
  results.forEach(ensureNoError);
};

const upsertMany = async (table: string, rows: unknown[], onConflict = 'id') => {
  if (!rows.length) {
    return;
  }
  const result = await supabase.from(table).upsert(rows, { onConflict });
  ensureNoError(result);
};

const mapProfile = (row: ProfileRow): UserProfile => ({
  userId: row.user_id,
  name: row.name,
  email: row.email,
  age: row.age,
  gender: row.gender,
  heightCm: row.height_cm,
  weightKg: row.weight_kg,
  targetWeightKg: row.target_weight_kg ?? undefined,
  goal: row.goal as Goal,
  dietPreference: row.diet_preference as DietPreference,
  allergies: row.allergies ?? [],
  activityLevel: row.activity_level,
  reminders: (row.reminders ?? {
    meals: true,
    water: true,
    fasting: true,
    protein: true,
    weeklySummary: true,
  }) as ReminderPreferences,
  googleFitConnected: row.google_fit_connected,
  aiAnalysisEnabled: row.ai_analysis_enabled,
  photoSavingEnabled: row.photo_saving_enabled,
});

const profileToRow = (profile: UserProfile): ProfileRow => ({
  user_id: profile.userId,
  name: profile.name,
  email: profile.email,
  age: profile.age,
  gender: profile.gender,
  height_cm: profile.heightCm,
  weight_kg: profile.weightKg,
  target_weight_kg: profile.targetWeightKg ?? null,
  goal: profile.goal,
  diet_preference: profile.dietPreference,
  allergies: profile.allergies,
  activity_level: profile.activityLevel,
  reminders: profile.reminders,
  google_fit_connected: profile.googleFitConnected,
  ai_analysis_enabled: profile.aiAnalysisEnabled,
  photo_saving_enabled: profile.photoSavingEnabled,
});

const mapTargets = (row: TargetRow): NutritionTargets => ({
  calories: row.calories,
  protein: row.protein,
  carbs: row.carbs,
  fat: row.fat,
  fiber: row.fiber,
  sugar: row.sugar,
  sodium: row.sodium,
  waterMl: row.water_ml,
});

const targetsToRow = (userId: string, targets: NutritionTargets) => ({
  user_id: userId,
  calories: targets.calories,
  protein: targets.protein,
  carbs: targets.carbs,
  fat: targets.fat,
  fiber: targets.fiber,
  sugar: targets.sugar,
  sodium: targets.sodium,
  water_ml: targets.waterMl,
});

const mapMeal = (row: MealRow): MealLog => ({
  id: row.id,
  name: row.meal_name,
  type: row.meal_type,
  quantity: row.quantity,
  source: row.source,
  createdAt: row.created_at,
  calories: row.calories,
  protein: row.protein,
  carbs: row.carbs,
  fat: row.fat,
  fiber: row.fiber,
  sugar: row.sugar,
  sodium: row.sodium,
  cost: row.cost ?? undefined,
  mood: row.mood ?? undefined,
  gutReaction: row.gut_reaction ?? undefined,
  allergens: row.allergens ?? [],
  confidence: row.confidence,
  verdict: row.verdict,
  photoUri: row.photo_url ?? undefined,
  isFavorite: row.is_favorite,
  isOutsideFood: row.is_outside_food,
});

const mealToRow = (userId: string, meal: MealLog): MealRow => ({
  id: meal.id,
  user_id: userId,
  meal_name: meal.name,
  meal_type: meal.type,
  quantity: meal.quantity,
  source: meal.source,
  photo_url: meal.photoUri ?? null,
  calories: meal.calories,
  protein: meal.protein,
  carbs: meal.carbs,
  fat: meal.fat,
  fiber: meal.fiber,
  sugar: meal.sugar,
  sodium: meal.sodium,
  cost: meal.cost ?? null,
  mood: meal.mood ?? null,
  gut_reaction: meal.gutReaction ?? null,
  allergens: meal.allergens,
  confidence: meal.confidence,
  verdict: meal.verdict,
  is_favorite: meal.isFavorite ?? false,
  is_outside_food: meal.isOutsideFood ?? false,
  created_at: meal.createdAt,
});

const mapSavedMeal = (row: SavedMealRow): SavedMeal => ({
  id: row.id,
  name: row.name,
  defaultServing: row.default_serving,
  calories: row.calories,
  protein: row.protein,
  carbs: row.carbs,
  fat: row.fat,
  fiber: row.fiber,
  sugar: row.sugar,
  sodium: row.sodium,
  tags: row.tags ?? [],
});

const savedMealToRow = (userId: string, meal: SavedMeal): SavedMealRow => ({
  id: meal.id,
  user_id: userId,
  name: meal.name,
  default_serving: meal.defaultServing,
  calories: meal.calories,
  protein: meal.protein,
  carbs: meal.carbs,
  fat: meal.fat,
  fiber: meal.fiber,
  sugar: meal.sugar,
  sodium: meal.sodium,
  tags: meal.tags,
});

const mapRecipe = (row: RecipeRow): Recipe => ({
  id: row.id,
  title: row.title,
  ingredients: row.ingredients ?? [],
  steps: row.steps ?? [],
  calories: row.calories,
  protein: row.protein,
  cookingTimeMinutes: row.cooking_time_minutes,
  difficulty: row.difficulty,
  goalTag: row.goal_tag,
  budget: row.budget,
  saved: row.saved,
  rating: row.rating ?? undefined,
});

const recipeToRow = (userId: string, recipe: Recipe): RecipeRow => ({
  id: recipe.id,
  user_id: userId,
  title: recipe.title,
  ingredients: recipe.ingredients,
  steps: recipe.steps,
  calories: recipe.calories,
  protein: recipe.protein,
  cooking_time_minutes: recipe.cookingTimeMinutes,
  difficulty: recipe.difficulty,
  goal_tag: recipe.goalTag,
  budget: recipe.budget,
  saved: recipe.saved,
  rating: recipe.rating ?? null,
});

const mapFastingSession = (row: FastingRow): FastingSession => ({
  id: row.id,
  plan: row.plan,
  startTime: row.start_time,
  endTime: row.end_time ?? undefined,
  mood: row.mood ?? undefined,
  hungerLevel: row.hunger_level ?? undefined,
  energy: row.energy ?? undefined,
  notes: row.notes ?? undefined,
});

const fastingToRow = (userId: string, session: FastingSession): FastingRow => ({
  id: session.id,
  user_id: userId,
  plan: session.plan,
  start_time: session.startTime,
  end_time: session.endTime ?? null,
  mood: session.mood ?? null,
  hunger_level: session.hungerLevel ?? null,
  energy: session.energy ?? null,
  notes: session.notes ?? null,
});

const mapHydrationLog = (row: HydrationRow): HydrationLog => ({
  id: row.id,
  amountMl: row.amount_ml,
  createdAt: row.created_at,
});

const hydrationToRow = (userId: string, log: HydrationLog): HydrationRow => ({
  id: log.id,
  user_id: userId,
  amount_ml: log.amountMl,
  created_at: log.createdAt,
});

const mapWeightLog = (row: WeightRow): WeightLog => ({
  id: row.id,
  weightKg: row.weight_kg,
  date: row.date,
});

const weightToRow = (userId: string, log: WeightLog): WeightRow => ({
  id: log.id,
  user_id: userId,
  weight_kg: log.weightKg,
  date: log.date,
});

const mapHealth = (row: HealthRow): HealthSnapshot => ({
  steps: row.steps,
  activeMinutes: row.active_minutes,
  caloriesBurned: row.calories_burned,
  heartRate: row.heart_rate ?? undefined,
  sleepHours: row.sleep_hours ?? undefined,
  lastSyncedAt: row.last_synced_at ?? undefined,
});

const healthToRow = (userId: string, health: HealthSnapshot): HealthRow => ({
  user_id: userId,
  steps: health.steps,
  active_minutes: health.activeMinutes,
  calories_burned: health.caloriesBurned,
  heart_rate: health.heartRate ?? null,
  sleep_hours: health.sleepHours ?? null,
  last_synced_at: health.lastSyncedAt ?? null,
});

const mapInsight = (row: InsightRow): WeeklyInsight => ({
  id: row.id,
  title: row.title,
  body: row.body,
  severity: row.severity,
});

const insightToRow = (userId: string, insight: WeeklyInsight): InsightRow => ({
  id: insight.id,
  user_id: userId,
  title: insight.title,
  body: insight.body,
  severity: insight.severity,
});
