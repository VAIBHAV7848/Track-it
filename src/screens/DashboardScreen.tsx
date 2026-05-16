import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  ChefHat,
  Droplets,
  Flame,
  Footprints,
  Mic,
  Moon,
  Plus,
  ScanLine,
  Trophy,
  Utensils,
} from 'lucide-react-native';

import {
  AppScreen,
  Divider,
  IconTile,
  Pill,
  PrimaryButton,
  ProgressBar,
  QuietButton,
  SectionHeader,
  Surface,
} from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import type { AppData } from '@/types';
import { formatClock, formatDuration, minutesBetween } from '@/utils/dates';
import { percent, remaining, sumMeals } from '@/utils/nutrition';

export const DashboardScreen = ({
  data,
  onGoLog,
  onGoCook,
  onGoFast,
  onAddWater,
}: {
  data: AppData;
  onGoLog: () => void;
  onGoCook: () => void;
  onGoFast: () => void;
  onAddWater: (amountMl: number) => void;
}) => {
  const totals = useMemo(() => sumMeals(data.meals), [data.meals]);
  const waterMl = useMemo(
    () => data.hydrationLogs.reduce((total, log) => total + log.amountMl, 0),
    [data.hydrationLogs],
  );
  const activeFast = data.fastingSessions.find((session) => !session.endTime);
  const fastMinutes = activeFast ? minutesBetween(activeFast.startTime) : 0;
  const proteinLeft = remaining(data.targets.protein, totals.protein);
  const calorieLeft = remaining(data.targets.calories, totals.calories);

  return (
    <AppScreen
      title={`Good ${greeting()}, ${data.profile.name}.`}
      subtitle={`${calorieLeft} calories and ${proteinLeft}g protein remaining today.`}
      action={<Pill label={`${data.meals.length} meals`} selected tone="green" />}
    >
      <Surface style={styles.scorePanel}>
        <View style={styles.scoreTop}>
          <View>
            <Text style={styles.scoreLabel}>Weekly health score</Text>
            <Text style={styles.scoreValue}>78</Text>
          </View>
          <View style={styles.badgeStack}>
            <Pill label="7-day logging" selected tone="green" />
            <Pill label="Protein close" selected tone="blue" />
          </View>
        </View>

        <View style={styles.progressBlock}>
          <MetricLine
            label="Calories"
            value={`${totals.calories}/${data.targets.calories} kcal`}
            progress={percent(totals.calories, data.targets.calories)}
            tint={colors.primary}
          />
          <MetricLine
            label="Protein"
            value={`${totals.protein}/${data.targets.protein}g`}
            progress={percent(totals.protein, data.targets.protein)}
            tint={colors.blue}
          />
          <MetricLine
            label="Water"
            value={`${waterMl}/${data.targets.waterMl} ml`}
            progress={percent(waterMl, data.targets.waterMl)}
            tint={colors.amber}
          />
        </View>
      </Surface>

      <View style={styles.quickGrid}>
        <IconTile label="Steps" value={data.health.steps.toLocaleString()} icon={Footprints} tone="blue" />
        <IconTile label="Fast" value={activeFast ? formatDuration(fastMinutes) : 'Ready'} icon={Moon} tone="violet" />
        <IconTile label="Burned" value={`${data.health.caloriesBurned} kcal`} icon={Flame} tone="amber" />
        <IconTile label="Streak" value="6 days" icon={Trophy} tone="green" />
      </View>

      <Surface>
        <SectionHeader title="Fast actions" />
        <View style={styles.actions}>
          <PrimaryButton label="Scan meal" icon={ScanLine} onPress={onGoLog} />
          <QuietButton label="Voice log" icon={Mic} onPress={onGoLog} />
          <QuietButton label="Cook" icon={ChefHat} onPress={onGoCook} />
          <QuietButton label="+500ml" icon={Droplets} onPress={() => onAddWater(500)} />
        </View>
      </Surface>

      <Surface>
        <SectionHeader title="Smart suggestion" aside={<Camera color={colors.primary} size={19} />} />
        <Text style={styles.suggestion}>
          You walked {data.health.steps.toLocaleString()} steps. Drink 400ml extra water and add a 25-30g protein meal
          before your fasting window.
        </Text>
        <Divider />
        <View style={styles.nextRow}>
          <Utensils color={colors.primary} size={18} />
          <Text style={styles.nextText}>
            Fasting window {activeFast ? `started at ${formatClock(activeFast.startTime)}` : 'starts at 9:30 PM'}.
          </Text>
          <QuietButton label="Open" onPress={onGoFast} />
        </View>
      </Surface>
    </AppScreen>
  );
};

const MetricLine = ({
  label,
  value,
  progress,
  tint,
}: {
  label: string;
  value: string;
  progress: number;
  tint: string;
}) => (
  <View style={styles.metricLine}>
    <View style={styles.metricLineTop}>
      <Text style={styles.metricLineLabel}>{label}</Text>
      <Text style={styles.metricLineValue}>{value}</Text>
    </View>
    <ProgressBar value={progress} tint={tint} />
  </View>
);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 17) {
    return 'afternoon';
  }
  return 'evening';
};

const styles = StyleSheet.create({
  scorePanel: {
    gap: spacing.lg,
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  scoreValue: {
    color: colors.ink,
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: 0,
  },
  badgeStack: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  progressBlock: {
    gap: spacing.md,
  },
  metricLine: {
    gap: spacing.sm,
  },
  metricLineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metricLineLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  metricLineValue: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestion: {
    color: colors.ink,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: '700',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextText: {
    flex: 1,
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
  },
});
