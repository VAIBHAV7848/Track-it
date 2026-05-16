import type { Goal } from '@/types';

export type PackagedFoodVerdict = {
  status: 'good' | 'caution' | 'avoid';
  title: string;
  body: string;
  score: number;
  flags: string[];
  barcode?: string;
};

const ultraProcessedTerms = [
  'palm oil',
  'hydrogenated',
  'maltodextrin',
  'high fructose',
  'artificial flavour',
  'artificial flavor',
  'preservative',
  'refined flour',
  'maida',
];

const allergenAliases: Record<string, string[]> = {
  milk: ['milk', 'whey', 'casein', 'curd', 'paneer', 'cheese', 'butter', 'ghee'],
  dairy: ['milk', 'whey', 'casein', 'curd', 'paneer', 'cheese', 'butter', 'ghee'],
  egg: ['egg', 'albumin'],
  eggs: ['egg', 'albumin'],
  gluten: ['wheat', 'gluten', 'barley', 'rye', 'maida'],
  peanut: ['peanut', 'groundnut'],
  peanuts: ['peanut', 'groundnut'],
  soy: ['soy', 'soya', 'soybean'],
  tree_nut: ['almond', 'cashew', 'walnut', 'pistachio', 'hazelnut'],
};

const readNumber = (label: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = label.match(pattern);
    const value = match?.[1] ? Number(match[1]) : undefined;
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

const hasGoal = (goal: Goal, values: Goal[]) => values.includes(goal);

export const evaluatePackagedFood = ({
  barcode,
  label,
  goal,
  allergies,
}: {
  barcode: string;
  label: string;
  goal: Goal;
  allergies: string[];
}): PackagedFoodVerdict => {
  const normalized = label.toLowerCase();
  const flags: string[] = [];
  let score = 70;

  const calories = readNumber(normalized, [
    /(?:energy|calories|kcal)\D{0,12}(\d+(?:\.\d+)?)/,
    /(\d+(?:\.\d+)?)\s*kcal/,
  ]);
  const protein = readNumber(normalized, [/protein\D{0,12}(\d+(?:\.\d+)?)/]);
  const sugar = readNumber(normalized, [/(?:total\s*)?sugars?\D{0,12}(\d+(?:\.\d+)?)/]);
  const sodium = readNumber(normalized, [/sodium\D{0,12}(\d+(?:\.\d+)?)/]);
  const fiber = readNumber(normalized, [/(?:fibre|fiber)\D{0,12}(\d+(?:\.\d+)?)/]);

  const riskyTerms = ultraProcessedTerms.filter((term) => normalized.includes(term));
  const allergyHits = allergies.flatMap((allergy) => {
    const aliases = allergenAliases[allergy.toLowerCase()] ?? [allergy.toLowerCase()];
    return aliases.some((alias) => normalized.includes(alias)) ? [allergy] : [];
  });

  if (!normalized.trim()) {
    flags.push('Add ingredients or nutrition text for a useful verdict');
    score -= 18;
  }
  if (barcode.trim()) {
    flags.push(`Barcode ${barcode.trim()} ready for lookup`);
  }
  if (allergyHits.length) {
    flags.push(`Allergen match: ${allergyHits.join(', ')}`);
    score -= 35;
  }
  if (riskyTerms.length) {
    flags.push(`Processed ingredients: ${riskyTerms.slice(0, 3).join(', ')}`);
    score -= Math.min(18, riskyTerms.length * 6);
  }
  if (typeof sugar === 'number' && sugar > 12) {
    flags.push(`High sugar: ${Math.round(sugar)}g`);
    score -= hasGoal(goal, ['fat-loss', 'cut', 'energy', 'skin-hair']) ? 16 : 9;
  }
  if (typeof sodium === 'number' && sodium > 450) {
    flags.push(`High sodium: ${Math.round(sodium)}mg`);
    score -= 12;
  }
  if (typeof calories === 'number' && calories > 320 && hasGoal(goal, ['fat-loss', 'cut'])) {
    flags.push(`Calorie dense for ${goal.replace('-', ' ')}`);
    score -= 12;
  }
  if (typeof protein === 'number') {
    if (protein >= 10) {
      flags.push(`Useful protein: ${Math.round(protein)}g`);
      score += hasGoal(goal, ['muscle-gain', 'bulk']) ? 10 : 5;
    } else if (hasGoal(goal, ['muscle-gain', 'bulk'])) {
      flags.push('Low protein for muscle goal');
      score -= 8;
    }
  }
  if (typeof fiber === 'number') {
    score += fiber >= 5 ? 6 : 0;
    if (fiber < 3 && goal === 'digestion') {
      flags.push('Low fiber for digestion goal');
      score -= 10;
    }
  }

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const status = clampedScore >= 75 ? 'good' : clampedScore >= 50 ? 'caution' : 'avoid';

  return {
    status,
    title: status === 'good' ? 'Fits your goal' : status === 'caution' ? 'Check before buying' : 'Better to skip',
    body:
      status === 'good'
        ? 'This product looks usable for your current target. Confirm serving size before logging.'
        : status === 'caution'
          ? 'This product has tradeoffs. Compare serving size, ingredients, and your remaining macros.'
          : 'This product conflicts with allergies, processing, or your current goal.',
    score: clampedScore,
    flags: flags.length ? flags : ['No major flags found from the entered label'],
    barcode: barcode.trim() || undefined,
  };
};
