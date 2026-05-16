import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bookmark, ChefHat, Clock3, ListChecks, Plus, Send, Sparkles, Star } from 'lucide-react-native';

import {
  AppScreen,
  Divider,
  EmptyState,
  Pill,
  PrimaryButton,
  QuietButton,
  SectionHeader,
  Surface,
  TextField,
} from '@/components/ui';
import { generateRecipes } from '@/services/ai';
import { colors, spacing, typography } from '@/theme';
import type { Recipe, UserProfile } from '@/types';

export const CookScreen = ({
  profile,
  recipes,
  onAddRecipe,
  onToggleSaved,
}: {
  profile: UserProfile;
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onToggleSaved: (recipeId: string) => void;
}) => {
  const [ingredients, setIngredients] = useState('eggs, bread, onion');
  const [time, setTime] = useState('15');
  const [servings, setServings] = useState('1');
  const [filter, setFilter] = useState('High protein');
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const savedRecipes = recipes.filter((recipe) => recipe.saved);
  const groceryList = useMemo(
    () =>
      savedRecipes
        .flatMap((recipe) => recipe.ingredients)
        .filter((item, index, all) => all.indexOf(item) === index)
        .slice(0, 8),
    [savedRecipes],
  );

  const askCookAssistant = async () => {
    setLoading(true);
    try {
      const generated = await generateRecipes(ingredients, profile.goal);
      setSuggestions(
        generated.map((recipe) => ({
          ...recipe,
          cookingTimeMinutes: Number(time) || recipe.cookingTimeMinutes,
          goalTag: filter.toLowerCase(),
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  const saveSuggestion = (recipe: Recipe) => {
    const saved = { ...recipe, saved: true, id: `saved-${Date.now()}` };
    onAddRecipe(saved);
    setSuggestions((current) => current.filter((item) => item.id !== recipe.id));
  };

  return (
    <AppScreen
      title="Cook assistant"
      subtitle={`${profile.dietPreference} · ${profile.goal.replace('-', ' ')} · allergies checked`}
      action={<Pill label={`${savedRecipes.length} saved`} selected tone="violet" />}
    >
      <Surface>
        <SectionHeader title="Recipe brief" aside={<ChefHat color={colors.primary} size={21} />} />
        <TextField label="Ingredients" value={ingredients} onChangeText={setIngredients} multiline />
        <View style={styles.grid}>
          <TextField label="Minutes" value={time} onChangeText={setTime} keyboardType="number-pad" />
          <TextField label="Servings" value={servings} onChangeText={setServings} keyboardType="number-pad" />
        </View>
        <View style={styles.chips}>
          {['High protein', 'Low carb', 'Budget', 'Quick', 'Gut-friendly'].map((item) => (
            <Pill
              key={item}
              label={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
              tone={item === 'Budget' ? 'amber' : 'green'}
            />
          ))}
        </View>
        <PrimaryButton label="Generate recipes" icon={Send} onPress={askCookAssistant} loading={loading} />
      </Surface>

      <Surface>
        <SectionHeader title="Suggestions" aside={<Sparkles color={colors.violet} size={20} />} />
        {suggestions.length === 0 ? (
          <EmptyState title="No fresh suggestions" body="Enter ingredients and generate a goal-aware recipe." />
        ) : (
          suggestions.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} actionLabel="Save" onAction={() => saveSuggestion(recipe)} />
          ))
        )}
      </Surface>

      <Surface>
        <SectionHeader title="Saved recipes" />
        {savedRecipes.length === 0 ? (
          <EmptyState title="No saved recipes" body="Save useful recipes to build a personal cooking database." />
        ) : (
          savedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              actionLabel={recipe.saved ? 'Saved' : 'Save'}
              onAction={() => onToggleSaved(recipe.id)}
            />
          ))
        )}
      </Surface>

      <Surface>
        <SectionHeader title="Grocery list" aside={<ListChecks color={colors.primary} size={20} />} />
        {groceryList.length === 0 ? (
          <EmptyState title="List is empty" body="Saved recipes will populate the shopping list." />
        ) : (
          <View style={styles.groceryGrid}>
            {groceryList.map((item) => (
              <Pill key={item} label={item} selected tone="blue" />
            ))}
          </View>
        )}
      </Surface>
    </AppScreen>
  );
};

const RecipeCard = ({
  recipe,
  actionLabel,
  onAction,
}: {
  recipe: Recipe;
  actionLabel: string;
  onAction: () => void;
}) => (
  <View style={styles.recipeCard}>
    <View style={styles.recipeTop}>
      <View style={styles.recipeTitleWrap}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <Text style={styles.recipeMeta}>
          {recipe.calories} kcal · {recipe.protein}g protein · {recipe.budget} budget
        </Text>
      </View>
      <QuietButton label={actionLabel} icon={recipe.saved ? Bookmark : Plus} onPress={onAction} />
    </View>
    <View style={styles.recipeBadges}>
      <Pill label={`${recipe.cookingTimeMinutes} min`} selected tone="amber" />
      <Pill label={recipe.goalTag} selected tone="green" />
      <Pill label={recipe.difficulty} selected tone="violet" />
      {recipe.rating ? <Pill label={`${recipe.rating}/5`} selected tone="blue" /> : null}
    </View>
    <Divider />
    <View style={styles.steps}>
      {recipe.steps.map((step, index) => (
        <View key={step} style={styles.stepRow}>
          <View style={styles.stepNumber}>
            {index === 0 ? <Clock3 color={colors.primary} size={14} /> : <Star color={colors.primary} size={14} />}
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recipeCard: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  recipeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  recipeTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  recipeTitle: {
    color: colors.ink,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  recipeMeta: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  recipeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  steps: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    color: colors.ink,
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: '600',
  },
  groceryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
