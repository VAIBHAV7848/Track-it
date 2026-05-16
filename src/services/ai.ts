import type { MealLog, Recipe } from '@/types';
import { mealVerdict } from '@/utils/nutrition';
import { supabase } from '@/services/supabase';

const id = (prefix: string) => `${prefix}-${Date.now()}`;

type AiResponse<T> = {
  result: T;
};

const invokeAi = async <T,>(body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke<AiResponse<T>>('ai-assistant', {
    body,
  });

  if (error || !data?.result) {
    throw new Error(error?.message ?? 'AI response was empty.');
  }

  return data.result;
};

const fallbackMealScan = (): MealLog => {
  const meal: MealLog = {
    id: id('scan'),
    name: 'Rice, dal, curd',
    type: 'lunch',
    quantity: '1 plate',
    source: 'scan',
    createdAt: new Date().toISOString(),
    calories: 620,
    protein: 22,
    carbs: 92,
    fat: 14,
    fiber: 8,
    sugar: 5,
    sodium: 800,
    allergens: ['milk'],
    confidence: 'medium',
    verdict: 'Good meal, but protein is slightly low for your muscle goal',
  };

  return {
    ...meal,
    verdict: mealVerdict(meal),
  };
};

export const analyzeMealPhoto = async (input?: {
  base64?: string;
  mimeType?: string;
}): Promise<MealLog> => {
  try {
    const result = await invokeAi<MealLog>({
      action: 'analyze-meal',
      imageBase64: input?.base64,
      mimeType: input?.mimeType ?? 'image/jpeg',
    });

    return {
      ...result,
      id: result.id || id('scan'),
      source: 'scan',
      createdAt: result.createdAt || new Date().toISOString(),
      verdict: result.verdict || mealVerdict(result),
    };
  } catch {
    return fallbackMealScan();
  }
};

const fallbackVoiceMeal = (transcript: string): MealLog => {
  const normalized = transcript.toLowerCase();
  const includesEgg = normalized.includes('egg');
  const includesChapati = normalized.includes('chapati') || normalized.includes('roti');

  const meal: MealLog = {
    id: id('voice'),
    name: includesEgg ? 'Egg meal' : includesChapati ? 'Chapati dal meal' : 'Voice logged meal',
    type: normalized.includes('breakfast')
      ? 'breakfast'
      : normalized.includes('dinner')
        ? 'dinner'
        : normalized.includes('snack')
          ? 'snack'
          : 'lunch',
    quantity: transcript,
    source: 'voice',
    createdAt: new Date().toISOString(),
    calories: includesEgg ? 430 : includesChapati ? 540 : 480,
    protein: includesEgg ? 28 : includesChapati ? 21 : 18,
    carbs: includesEgg ? 32 : includesChapati ? 74 : 55,
    fat: includesEgg ? 21 : includesChapati ? 15 : 18,
    fiber: includesChapati ? 9 : 5,
    sugar: 5,
    sodium: includesChapati ? 690 : 540,
    allergens: includesEgg ? ['egg'] : [],
    confidence: 'medium',
    verdict: 'Confirm serving size before saving',
  };

  return {
    ...meal,
    verdict: mealVerdict(meal),
  };
};

export const parseVoiceMeal = async (transcript: string): Promise<MealLog> => {
  try {
    const result = await invokeAi<MealLog>({
      action: 'parse-voice-meal',
      transcript,
    });

    return {
      ...result,
      id: result.id || id('voice'),
      source: 'voice',
      createdAt: result.createdAt || new Date().toISOString(),
      verdict: result.verdict || mealVerdict(result),
    };
  } catch {
    return fallbackVoiceMeal(transcript);
  }
};

const fallbackRecipes = (ingredients: string, goal: string): Recipe[] => {
  const input = ingredients.toLowerCase();
  const hasEggs = input.includes('egg');
  const hasRice = input.includes('rice');
  const baseTitle = hasEggs ? 'High-protein egg bhurji bowl' : hasRice ? 'Leftover rice protein bowl' : 'Budget protein plate';

  return [
    {
      id: id('recipe'),
      title: baseTitle,
      ingredients: ingredients
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .concat(hasEggs ? ['onion', 'curd', 'coriander'] : ['dal', 'curd', 'cucumber']),
      steps: [
        'Prep ingredients and keep oil measured.',
        'Cook protein first, then fold in carbs or leftovers.',
        'Finish with curd, lemon, and vegetables for volume.',
      ],
      calories: goal === 'cut' ? 460 : 620,
      protein: hasEggs ? 34 : 28,
      cookingTimeMinutes: hasEggs ? 14 : 18,
      difficulty: 'easy',
      goalTag: goal === 'cut' ? 'cut-friendly' : 'high-protein',
      budget: 'low',
      saved: false,
    },
  ];
};

export const generateRecipes = async (ingredients: string, goal: string): Promise<Recipe[]> => {
  try {
    const result = await invokeAi<Recipe[]>({
      action: 'generate-recipes',
      ingredients,
      goal,
    });

    return result.map((recipe) => ({
      ...recipe,
      id: recipe.id || id('recipe'),
      saved: recipe.saved ?? false,
    }));
  } catch {
    return fallbackRecipes(ingredients, goal);
  }
};
