import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  CheckCircle2,
  Clock3,
  Edit3,
  HeartPulse,
  Mic,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
} from 'lucide-react-native';

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
import { analyzeMealPhoto, parseVoiceMeal } from '@/services/ai';
import { colors, spacing, typography } from '@/theme';
import type { MealLog, MealType, SavedMeal } from '@/types';
import { formatClock } from '@/utils/dates';
import { mealVerdict } from '@/utils/nutrition';

type LogMode = 'scan' | 'manual' | 'voice' | 'journal';

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const LogScreen = ({
  meals,
  savedMeals,
  onAddMeal,
}: {
  meals: MealLog[];
  savedMeals: SavedMeal[];
  onAddMeal: (meal: MealLog) => void;
}) => {
  const [mode, setMode] = useState<LogMode>('scan');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<MealLog | null>(null);
  const [voiceText, setVoiceText] = useState('I ate two chapatis, dal, rice, and curd for lunch');
  const [voiceResult, setVoiceResult] = useState<MealLog | null>(null);
  const [manual, setManual] = useState({
    name: 'Paneer rice bowl',
    quantity: '1 bowl',
    calories: '560',
    protein: '31',
    carbs: '62',
    fat: '18',
    cost: '95',
    mood: 'focused',
    gutReaction: 'normal',
    type: 'dinner' as MealType,
  });

  const recentMeals = useMemo(
    () => [...meals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [meals],
  );

  const startScan = async () => {
    setScanLoading(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const picked = permission.granted
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.75,
            base64: true,
          })
        : null;

      const asset = picked && !picked.canceled ? picked.assets[0] : undefined;
      const result = await analyzeMealPhoto({
        base64: asset?.base64 ?? undefined,
        mimeType: asset?.mimeType ?? 'image/jpeg',
      });
      setScanResult({
        ...result,
        photoUri: asset?.uri,
      });
      await Haptics.selectionAsync();
    } finally {
      setScanLoading(false);
    }
  };

  const saveMeal = async (meal: MealLog) => {
    onAddMeal(meal);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScanResult(null);
    setVoiceResult(null);
  };

  const saveManualMeal = () => {
    const meal: MealLog = {
      id: `manual-${Date.now()}`,
      name: manual.name || 'Manual meal',
      type: manual.type,
      quantity: manual.quantity || '1 serving',
      source: 'manual',
      createdAt: new Date().toISOString(),
      calories: numberFrom(manual.calories),
      protein: numberFrom(manual.protein),
      carbs: numberFrom(manual.carbs),
      fat: numberFrom(manual.fat),
      fiber: 5,
      sugar: 6,
      sodium: 650,
      allergens: [],
      confidence: 'high',
      verdict: '',
      cost: numberFrom(manual.cost),
      mood: manual.mood,
      gutReaction: manual.gutReaction,
    };
    saveMeal({ ...meal, verdict: mealVerdict(meal) });
  };

  const saveSavedMeal = (saved: SavedMeal) => {
    saveMeal({
      id: `saved-${Date.now()}`,
      name: saved.name,
      type: 'snack',
      quantity: saved.defaultServing,
      source: 'saved',
      createdAt: new Date().toISOString(),
      calories: saved.calories,
      protein: saved.protein,
      carbs: saved.carbs,
      fat: saved.fat,
      fiber: saved.fiber,
      sugar: saved.sugar,
      sodium: saved.sodium,
      allergens: [],
      confidence: 'high',
      verdict: mealVerdict(saved),
      isFavorite: true,
    });
  };

  const parseVoice = async () => {
    const parsed = await parseVoiceMeal(voiceText);
    setVoiceResult(parsed);
  };

  return (
    <AppScreen
      title="Food log"
      subtitle="Scan, speak, repeat saved meals, or enter exact macros."
      action={<Pill label={`${recentMeals.length} today`} selected tone="blue" />}
    >
      <View style={styles.modeTabs}>
        <Pill label="Scan" selected={mode === 'scan'} onPress={() => setMode('scan')} tone="green" />
        <Pill label="Manual" selected={mode === 'manual'} onPress={() => setMode('manual')} tone="blue" />
        <Pill label="Voice" selected={mode === 'voice'} onPress={() => setMode('voice')} tone="violet" />
        <Pill label="Journal" selected={mode === 'journal'} onPress={() => setMode('journal')} tone="amber" />
      </View>

      {mode === 'scan' ? (
        <>
          <Surface>
            <SectionHeader title="Meal scanner" aside={<Camera color={colors.primary} size={21} />} />
            <View style={styles.scanFrame}>
              {scanResult?.photoUri ? (
                <Image source={{ uri: scanResult.photoUri }} style={styles.scanImage} />
              ) : (
                <View style={styles.scanEmpty}>
                  <Search color={colors.primary} size={34} />
                  <Text style={styles.scanTitle}>Food photo</Text>
                </View>
              )}
            </View>
            <View style={styles.scanActions}>
              <PrimaryButton label="Choose photo" icon={Camera} onPress={startScan} loading={scanLoading} />
              <QuietButton label="Use saved meal" icon={RotateCcw} onPress={() => setMode('journal')} />
            </View>
          </Surface>

          {scanResult ? (
            <ConfirmMealCard meal={scanResult} onChange={setScanResult} onSave={() => saveMeal(scanResult)} />
          ) : null}
        </>
      ) : null}

      {mode === 'manual' ? (
        <Surface>
          <SectionHeader title="Manual meal" aside={<Edit3 color={colors.primary} size={20} />} />
          <View style={styles.chips}>
            {mealTypes.map((type) => (
              <Pill
                key={type}
                label={type}
                selected={manual.type === type}
                onPress={() => setManual((current) => ({ ...current, type }))}
                tone="blue"
              />
            ))}
          </View>
          <TextField label="Meal name" value={manual.name} onChangeText={(name) => setManual((m) => ({ ...m, name }))} />
          <TextField
            label="Quantity"
            value={manual.quantity}
            onChangeText={(quantity) => setManual((m) => ({ ...m, quantity }))}
          />
          <View style={styles.grid}>
            <TextField
              label="Calories"
              value={manual.calories}
              onChangeText={(calories) => setManual((m) => ({ ...m, calories }))}
              keyboardType="number-pad"
            />
            <TextField
              label="Protein g"
              value={manual.protein}
              onChangeText={(protein) => setManual((m) => ({ ...m, protein }))}
              keyboardType="number-pad"
            />
            <TextField
              label="Carbs g"
              value={manual.carbs}
              onChangeText={(carbs) => setManual((m) => ({ ...m, carbs }))}
              keyboardType="number-pad"
            />
            <TextField
              label="Fat g"
              value={manual.fat}
              onChangeText={(fat) => setManual((m) => ({ ...m, fat }))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.grid}>
            <TextField
              label="Cost"
              value={manual.cost}
              onChangeText={(cost) => setManual((m) => ({ ...m, cost }))}
              keyboardType="number-pad"
            />
            <TextField label="Mood" value={manual.mood} onChangeText={(mood) => setManual((m) => ({ ...m, mood }))} />
          </View>
          <TextField
            label="Gut reaction"
            value={manual.gutReaction}
            onChangeText={(gutReaction) => setManual((m) => ({ ...m, gutReaction }))}
          />
          <PrimaryButton label="Save meal" icon={Save} onPress={saveManualMeal} />
        </Surface>
      ) : null}

      {mode === 'voice' ? (
        <>
          <Surface>
            <SectionHeader title="Voice meal" aside={<Mic color={colors.violet} size={20} />} />
            <TextField label="Transcript" value={voiceText} onChangeText={setVoiceText} multiline />
            <PrimaryButton label="Parse meal" icon={Sparkles} onPress={parseVoice} />
          </Surface>
          {voiceResult ? (
            <ConfirmMealCard meal={voiceResult} onChange={setVoiceResult} onSave={() => saveMeal(voiceResult)} />
          ) : null}
        </>
      ) : null}

      {mode === 'journal' ? (
        <>
          <Surface>
            <SectionHeader title="Saved meals" />
            <View style={styles.savedList}>
              {savedMeals.map((meal) => (
                <View key={meal.id} style={styles.savedRow}>
                  <View style={styles.savedText}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealMeta}>
                      {meal.defaultServing} · {meal.calories} kcal · {meal.protein}g protein
                    </Text>
                  </View>
                  <QuietButton label="Log" icon={Plus} onPress={() => saveSavedMeal(meal)} />
                </View>
              ))}
            </View>
          </Surface>

          <Surface>
            <SectionHeader title="Meal journal" />
            {recentMeals.length === 0 ? (
              <EmptyState title="No meals yet" body="Log one meal to start the daily journal." />
            ) : (
              recentMeals.map((meal, index) => (
                <MealJournalRow key={meal.id} meal={meal} last={index === recentMeals.length - 1} />
              ))
            )}
          </Surface>
        </>
      ) : null}
    </AppScreen>
  );
};

const ConfirmMealCard = ({
  meal,
  onChange,
  onSave,
}: {
  meal: MealLog;
  onChange: (meal: MealLog) => void;
  onSave: () => void;
}) => (
  <Surface>
    <SectionHeader title="Confirm meal" aside={<CheckCircle2 color={colors.primary} size={21} />} />
    <View style={styles.confirmGrid}>
      <TextField label="Food" value={meal.name} onChangeText={(name) => onChange({ ...meal, name })} />
      <TextField label="Portion" value={meal.quantity} onChangeText={(quantity) => onChange({ ...meal, quantity })} />
    </View>
    <View style={styles.nutritionGrid}>
      <Macro label="Calories" value={`${meal.calories}`} />
      <Macro label="Protein" value={`${meal.protein}g`} />
      <Macro label="Carbs" value={`${meal.carbs}g`} />
      <Macro label="Fat" value={`${meal.fat}g`} />
      <Macro label="Fiber" value={`${meal.fiber}g`} />
      <Macro label="Sodium" value={`${meal.sodium}mg`} />
    </View>
    <View style={styles.verdict}>
      <HeartPulse color={colors.primary} size={18} />
      <Text style={styles.verdictText}>
        {meal.verdict} · {meal.confidence} confidence
      </Text>
    </View>
    <PrimaryButton label="Save to today" icon={Save} onPress={onSave} />
  </Surface>
);

const MealJournalRow = ({ meal, last }: { meal: MealLog; last: boolean }) => (
  <View style={styles.journalWrap}>
    <View style={styles.journalRow}>
      <View style={styles.journalIcon}>
        <Clock3 color={colors.primary} size={17} />
      </View>
      <View style={styles.savedText}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealMeta}>
          {formatClock(meal.createdAt)} · {meal.type} · {meal.calories} kcal · {meal.protein}g protein
        </Text>
        <Text style={styles.mealVerdict}>{meal.verdict}</Text>
      </View>
    </View>
    {!last ? <Divider /> : null}
  </View>
);

const Macro = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.macro}>
    <Text style={styles.macroValue} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

const numberFrom = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

const styles = StyleSheet.create({
  modeTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scanFrame: {
    height: 210,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.faint,
    overflow: 'hidden',
  },
  scanImage: {
    width: '100%',
    height: '100%',
  },
  scanEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  scanTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '900',
  },
  scanActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  confirmGrid: {
    gap: spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  macro: {
    minWidth: 92,
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.faint,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  macroValue: {
    color: colors.ink,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  macroLabel: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: '800',
    marginTop: 2,
  },
  verdict: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.mint,
    borderRadius: 8,
    padding: spacing.md,
  },
  verdictText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '800',
  },
  savedList: {
    gap: spacing.md,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  savedText: {
    flex: 1,
    minWidth: 0,
  },
  mealName: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '900',
  },
  mealMeta: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  mealVerdict: {
    color: colors.primary,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 3,
  },
  journalWrap: {
    gap: spacing.md,
  },
  journalRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  journalIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
