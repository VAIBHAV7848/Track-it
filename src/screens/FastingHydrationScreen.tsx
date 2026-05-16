import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BatteryCharging,
  Bell,
  Droplets,
  Flame,
  Moon,
  Plus,
  Scale,
  Square,
  TimerReset,
} from 'lucide-react-native';

import {
  AppScreen,
  IconTile,
  Pill,
  PrimaryButton,
  ProgressBar,
  QuietButton,
  SectionHeader,
  Surface,
  TextField,
} from '@/components/ui';
import { buildReminderPlan } from '@/services/notifications';
import { colors, spacing, typography } from '@/theme';
import type { FastingSession, HydrationLog, ReminderPreferences, WeightLog } from '@/types';
import { formatClock, formatDuration, minutesBetween, toIsoDate } from '@/utils/dates';
import { percent } from '@/utils/nutrition';

const plans = ['12:12', '14:10', '16:8', '18:6', '20:4'];

export const FastingHydrationScreen = ({
  waterTargetMl,
  hydrationLogs,
  fastingSessions,
  weightLogs,
  reminders,
  steps,
  onAddWater,
  onStartFast,
  onEndFast,
  onAddWeight,
}: {
  waterTargetMl: number;
  hydrationLogs: HydrationLog[];
  fastingSessions: FastingSession[];
  weightLogs: WeightLog[];
  reminders: ReminderPreferences;
  steps: number;
  onAddWater: (amountMl: number) => void;
  onStartFast: (plan: string) => void;
  onEndFast: (sessionId: string) => void;
  onAddWeight: (weightKg: number) => void;
}) => {
  const [selectedPlan, setSelectedPlan] = useState('16:8');
  const [now, setNow] = useState(Date.now());
  const [weight, setWeight] = useState(weightLogs.at(-1)?.weightKg.toString() ?? '70');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeFast = fastingSessions.find((session) => !session.endTime);
  const fastMinutes = activeFast ? minutesBetween(activeFast.startTime, new Date(now).toISOString()) : 0;
  const waterMl = useMemo(
    () => hydrationLogs.reduce((total, log) => total + log.amountMl, 0),
    [hydrationLogs],
  );
  const extraWater = steps > 6500 ? 400 : 0;
  const adjustedTarget = waterTargetMl + extraWater;
  const reminderPlan = buildReminderPlan(reminders);
  const latestWeight = weightLogs.at(-1);
  const previousWeight = weightLogs.at(-2);
  const weightDelta =
    latestWeight && previousWeight ? `${(latestWeight.weightKg - previousWeight.weightKg).toFixed(1)} kg` : 'New';

  return (
    <AppScreen
      title="Fasting & hydration"
      subtitle={`${waterMl}ml water logged. Activity adjusted target: ${adjustedTarget}ml.`}
      action={<Pill label={activeFast ? 'Fast active' : 'Ready'} selected tone={activeFast ? 'violet' : 'green'} />}
    >
      <Surface>
        <SectionHeader title="Fasting timer" aside={<Moon color={colors.violet} size={21} />} />
        <View style={styles.timerRow}>
          <View>
            <Text style={styles.timerValue}>{activeFast ? formatDuration(fastMinutes) : '0h 0m'}</Text>
            <Text style={styles.timerMeta}>
              {activeFast ? `Started ${formatClock(activeFast.startTime)} · ${activeFast.plan}` : 'No active fast'}
            </Text>
          </View>
          <IconTile label="Streak" value="5 fasts" icon={Flame} tone="amber" />
        </View>
        <View style={styles.chips}>
          {plans.map((plan) => (
            <Pill
              key={plan}
              label={plan}
              selected={selectedPlan === plan}
              onPress={() => setSelectedPlan(plan)}
              tone="violet"
            />
          ))}
        </View>
        {activeFast ? (
          <PrimaryButton label="End fast" icon={Square} tone="dark" onPress={() => onEndFast(activeFast.id)} />
        ) : (
          <PrimaryButton label="Start fast" icon={TimerReset} onPress={() => onStartFast(selectedPlan)} />
        )}
      </Surface>

      <Surface>
        <SectionHeader title="Water" aside={<Droplets color={colors.blue} size={21} />} />
        <View style={styles.waterTop}>
          <Text style={styles.waterValue}>{Math.round(percent(waterMl, adjustedTarget) * 100)}%</Text>
          <View style={styles.waterText}>
            <Text style={styles.sectionCopy}>{waterMl}ml of {adjustedTarget}ml</Text>
            <Text style={styles.mutedCopy}>
              {extraWater ? `${steps.toLocaleString()} steps added ${extraWater}ml.` : 'Target based on weight.'}
            </Text>
          </View>
        </View>
        <ProgressBar value={percent(waterMl, adjustedTarget)} tint={colors.blue} />
        <View style={styles.actions}>
          {[250, 500, 1000].map((amount) => (
            <QuietButton key={amount} label={`+${amount}ml`} icon={Plus} onPress={() => onAddWater(amount)} />
          ))}
        </View>
      </Surface>

      <View style={styles.quickGrid}>
        <IconTile label="Energy" value={activeFast?.energy ?? 'medium'} icon={BatteryCharging} tone="green" />
        <IconTile label="Hunger" value={`${activeFast?.hungerLevel ?? 2}/5`} icon={Flame} tone="rose" />
      </View>

      <Surface>
        <SectionHeader title="Weight trend" aside={<Scale color={colors.primary} size={21} />} />
        <View style={styles.weightRow}>
          <TextField label="Today kg" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          <View style={styles.weightDelta}>
            <Text style={styles.weightDeltaLabel}>7-day change</Text>
            <Text style={styles.weightDeltaValue}>{weightDelta}</Text>
          </View>
        </View>
        <PrimaryButton label="Save weight" icon={Scale} onPress={() => onAddWeight(Number(weight) || 0)} />
      </Surface>

      <Surface>
        <SectionHeader title="Reminder plan" aside={<Bell color={colors.primary} size={20} />} />
        <View style={styles.reminderList}>
          {reminderPlan.map((item) => (
            <View key={item} style={styles.reminderRow}>
              <View style={styles.dot} />
              <Text style={styles.reminderText}>{item}</Text>
            </View>
          ))}
        </View>
      </Surface>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  timerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerValue: {
    color: colors.ink,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
  },
  timerMeta: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  waterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  waterValue: {
    width: 82,
    color: colors.blue,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  waterText: {
    flex: 1,
  },
  sectionCopy: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '900',
  },
  mutedCopy: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  weightDelta: {
    minHeight: 70,
    minWidth: 132,
    flex: 1,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    justifyContent: 'center',
  },
  weightDeltaLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  weightDeltaValue: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '900',
    marginTop: 2,
  },
  reminderList: {
    gap: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 5,
  },
  reminderText: {
    flex: 1,
    color: colors.ink,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
  },
});
