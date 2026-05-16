import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity, ArrowRight, Bell, Dumbbell, ShieldCheck } from 'lucide-react-native';

import {
  AppScreen,
  Pill,
  PrimaryButton,
  ProgressBar,
  QuietButton,
  SectionHeader,
  Surface,
  TextField,
} from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import type { AuthUser, DietPreference, Goal, ReminderPreferences, UserProfile } from '@/types';
import { targetForGoal } from '@/utils/nutrition';

const goals: Array<{ label: string; value: Goal }> = [
  { label: 'Gain muscle', value: 'muscle-gain' },
  { label: 'Cut', value: 'cut' },
  { label: 'Bulk', value: 'bulk' },
  { label: 'Maintain', value: 'maintain' },
  { label: 'Digestion', value: 'digestion' },
  { label: 'Energy', value: 'energy' },
  { label: 'Skin & hair', value: 'skin-hair' },
  { label: 'Healthy', value: 'healthy' },
];

const diets: Array<{ label: string; value: DietPreference }> = [
  { label: 'Non-vegetarian', value: 'non-vegetarian' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Eggetarian', value: 'eggetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Jain', value: 'jain' },
];

const allergyOptions = ['Milk', 'Peanut', 'Soy', 'Gluten', 'Egg', 'Seafood', 'Tree nuts', 'None'];

export const OnboardingScreen = ({
  user,
  onComplete,
}: {
  user: AuthUser;
  onComplete: (profile: UserProfile) => void;
}) => {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('21');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [targetWeight, setTargetWeight] = useState('67');
  const [goal, setGoal] = useState<Goal>('muscle-gain');
  const [diet, setDiet] = useState<DietPreference>('non-vegetarian');
  const [activityLevel, setActivityLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [allergies, setAllergies] = useState<string[]>(['Milk']);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [reminders, setReminders] = useState<ReminderPreferences>({
    meals: true,
    water: true,
    fasting: true,
    protein: true,
    weeklySummary: true,
  });

  const progress = useMemo(() => (step + 1) / 4, [step]);

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setAllergies([]);
      return;
    }
    setAllergies((current) =>
      current.includes(allergy) ? current.filter((item) => item !== allergy) : current.concat(allergy),
    );
  };

  const finish = () => {
    const profile: UserProfile = {
      userId: user.id,
      name: user.name,
      email: user.email,
      age: Number(age) || 21,
      gender,
      heightCm: Number(height) || 175,
      weightKg: Number(weight) || 70,
      targetWeightKg: targetWeight ? Number(targetWeight) : undefined,
      goal,
      dietPreference: diet,
      allergies: allergies.map((item) => item.toLowerCase()),
      activityLevel,
      reminders,
      googleFitConnected,
      aiAnalysisEnabled: true,
      photoSavingEnabled: false,
    };
    targetForGoal(profile.goal, profile.weightKg);
    onComplete(profile);
  };

  return (
    <AppScreen
      title="Set up your baseline"
      subtitle="Targets stay editable. Start realistic, then let logs improve the estimates."
      action={<Text style={styles.step}>{step + 1}/4</Text>}
    >
      <ProgressBar value={progress} />

      {step === 0 ? (
        <Surface>
          <SectionHeader title="Body details" aside={<Dumbbell color={colors.primary} size={20} />} />
          <View style={styles.grid}>
            <TextField label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
            <TextField label="Gender" value={gender} onChangeText={setGender} />
            <TextField label="Height cm" value={height} onChangeText={setHeight} keyboardType="number-pad" />
            <TextField label="Weight kg" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          </View>
          <TextField
            label="Target weight kg"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="decimal-pad"
          />
        </Surface>
      ) : null}

      {step === 1 ? (
        <Surface>
          <SectionHeader title="Goal and diet" />
          <View style={styles.chips}>
            {goals.map((item) => (
              <Pill
                key={item.value}
                label={item.label}
                selected={goal === item.value}
                onPress={() => setGoal(item.value)}
                tone="green"
              />
            ))}
          </View>
          <View style={styles.chips}>
            {diets.map((item) => (
              <Pill
                key={item.value}
                label={item.label}
                selected={diet === item.value}
                onPress={() => setDiet(item.value)}
                tone="blue"
              />
            ))}
          </View>
        </Surface>
      ) : null}

      {step === 2 ? (
        <Surface>
          <SectionHeader title="Allergies and activity" aside={<ShieldCheck color={colors.primary} size={20} />} />
          <View style={styles.chips}>
            {allergyOptions.map((item) => (
              <Pill
                key={item}
                label={item}
                selected={item === 'None' ? allergies.length === 0 : allergies.includes(item)}
                onPress={() => toggleAllergy(item)}
                tone={item === 'None' ? 'green' : 'amber'}
              />
            ))}
          </View>
          <View style={styles.chips}>
            {(['low', 'moderate', 'high'] as const).map((item) => (
              <Pill
                key={item}
                label={`${item[0]?.toUpperCase()}${item.slice(1)}`}
                selected={activityLevel === item}
                onPress={() => setActivityLevel(item)}
                tone="violet"
              />
            ))}
          </View>
        </Surface>
      ) : null}

      {step === 3 ? (
        <Surface>
          <SectionHeader title="Sync and reminders" aside={<Bell color={colors.primary} size={20} />} />
          <Pill
            label={googleFitConnected ? 'Google Fit connected' : 'Connect Google Fit later'}
            selected={googleFitConnected}
            onPress={() => setGoogleFitConnected((value) => !value)}
            tone="blue"
          />
          <View style={styles.chips}>
            {Object.entries(reminders).map(([key, value]) => (
              <Pill
                key={key}
                label={reminderLabel(key)}
                selected={value}
                onPress={() => setReminders((current) => ({ ...current, [key]: !current[key as keyof ReminderPreferences] }))}
                tone="green"
              />
            ))}
          </View>
          <View style={styles.notice}>
            <Activity color={colors.amber} size={17} />
            <Text style={styles.noticeText}>
              Health data, meal photos, and AI analysis controls are available in Privacy after setup.
            </Text>
          </View>
        </Surface>
      ) : null}

      <View style={styles.actions}>
        {step > 0 ? <QuietButton label="Back" onPress={() => setStep((value) => value - 1)} /> : <View />}
        <PrimaryButton
          label={step === 3 ? 'Start tracking' : 'Next'}
          icon={ArrowRight}
          onPress={step === 3 ? finish : () => setStep((value) => value + 1)}
        />
      </View>
    </AppScreen>
  );
};

const reminderLabel = (key: string) => {
  switch (key) {
    case 'weeklySummary':
      return 'Weekly summary';
    default:
      return `${key[0]?.toUpperCase()}${key.slice(1)}`;
  }
};

const styles = StyleSheet.create({
  step: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '900',
  },
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
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.amberSoft,
    borderRadius: 8,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    color: colors.ink,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
});
