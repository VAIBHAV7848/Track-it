import type { MealLog, NutritionTargets } from '@/types';

export const emptyMacros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

export const sumMeals = (meals: MealLog[]) =>
  meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      protein: total.protein + meal.protein,
      carbs: total.carbs + meal.carbs,
      fat: total.fat + meal.fat,
      fiber: total.fiber + meal.fiber,
      sugar: total.sugar + meal.sugar,
      sodium: total.sodium + meal.sodium,
    }),
    emptyMacros,
  );

export const percent = (value: number, target: number) => {
  if (target <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, value / target));
};

export const remaining = (target: number, value: number) => Math.max(0, Math.round(target - value));

export const targetForGoal = (goal: string, weightKg: number): NutritionTargets => {
  const protein = Math.round(weightKg * (goal === 'muscle-gain' || goal === 'bulk' ? 2 : 1.7));
  const calories =
    goal === 'cut' || goal === 'fat-loss'
      ? Math.round(weightKg * 27)
      : goal === 'bulk' || goal === 'muscle-gain'
        ? Math.round(weightKg * 36)
        : Math.round(weightKg * 31);

  return {
    calories,
    protein,
    carbs: Math.round((calories * 0.45) / 4),
    fat: Math.round((calories * 0.28) / 9),
    fiber: 32,
    sugar: 45,
    sodium: 2200,
    waterMl: Math.round(weightKg * 38),
  };
};

export const mealVerdict = (meal: Pick<MealLog, 'protein' | 'calories' | 'sodium'>) => {
  if (meal.protein >= 30 && meal.calories < 650) {
    return 'High protein and fits today well';
  }
  if (meal.sodium > 900) {
    return 'Watch sodium and add water';
  }
  if (meal.protein < 15) {
    return 'Protein is low for your goal';
  }
  return 'Good balanced meal';
};
