import React, { useMemo, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import {
  Activity,
  Barcode,
  BellOff,
  Database,
  Download,
  HeartPulse,
  LogOut,
  Pill as PillIcon,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingDown,
} from 'lucide-react-native';

import {
  AppScreen,
  Divider,
  IconTile,
  Pill,
  PrimaryButton,
  QuietButton,
  SectionHeader,
  Surface,
  TextField,
} from '@/components/ui';
import { syncHealthConnect } from '@/services/health';
import { colors, spacing, typography } from '@/theme';
import type { AppData, HealthSnapshot, ReminderPreferences } from '@/types';
import { formatClock } from '@/utils/dates';
import { evaluatePackagedFood, type PackagedFoodVerdict } from '@/utils/grocery';

type ReminderKey = keyof ReminderPreferences;

const reminderItems: Array<{ key: ReminderKey; label: string }> = [
  { key: 'meals', label: 'Meals' },
  { key: 'water', label: 'Water' },
  { key: 'fasting', label: 'Fasting' },
  { key: 'protein', label: 'Protein' },
  { key: 'weeklySummary', label: 'Weekly' },
];

export const InsightsScreen = ({
  data,
  onHealthSync,
  onToggleGoogleFit,
  onToggleAi,
  onTogglePhotoSaving,
  onToggleReminder,
  onLogout,
  onDeleteAllData,
}: {
  data: AppData;
  onHealthSync: (health: HealthSnapshot) => void;
  onToggleGoogleFit: () => void;
  onToggleAi: () => void;
  onTogglePhotoSaving: () => void;
  onToggleReminder: (key: ReminderKey) => void;
  onLogout: () => void;
  onDeleteAllData: () => void;
}) => {
  const [barcode, setBarcode] = useState('8901030865569');
  const [productLabel, setProductLabel] = useState(
    'Ingredients: rolled oats, milk solids, cocoa, sugar. Nutrition per serving: 190 kcal, protein 7g, sugar 9g, sodium 180mg, fiber 5g.',
  );
  const [productVerdict, setProductVerdict] = useState<PackagedFoodVerdict | null>(null);
  const [exportMessage, setExportMessage] = useState<string>();

  const weeklyAverageCalories = useMemo(
    () => Math.round(data.meals.reduce((total, meal) => total + meal.calories, 0) / Math.max(1, data.meals.length)),
    [data.meals],
  );
  const weeklyAverageProtein = useMemo(
    () => Math.round(data.meals.reduce((total, meal) => total + meal.protein, 0) / Math.max(1, data.meals.length)),
    [data.meals],
  );
  const totalSpend = data.meals.reduce((total, meal) => total + (meal.cost ?? 0), 0);
  const outsideSpend = data.meals
    .filter((meal) => meal.isOutsideFood)
    .reduce((total, meal) => total + (meal.cost ?? 0), 0);

  const runHealthSync = async () => {
    const health = await syncHealthConnect();
    onHealthSync(health);
  };

  const checkProduct = () => {
    setProductVerdict(
      evaluatePackagedFood({
        barcode,
        label: productLabel,
        goal: data.profile.goal,
        allergies: data.profile.allergies,
      }),
    );
  };

  const exportData = async () => {
    const payload = {
      app: 'Track It',
      exportedAt: new Date().toISOString(),
      profileEmail: data.profile.email,
      data,
    };

    try {
      await Share.share({
        title: 'Track It data export',
        message: JSON.stringify(payload, null, 2),
      });
      setExportMessage('Data export prepared.');
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : 'Unable to export data.');
    }
  };

  return (
    <AppScreen
      title="Insights"
      subtitle="Weekly nutrition, activity, privacy, and data controls."
      action={<Pill label="Sunday report" selected tone="green" />}
    >
      <Surface>
        <SectionHeader title="Weekly summary" aside={<HeartPulse color={colors.primary} size={21} />} />
        <View style={styles.summaryGrid}>
          <IconTile label="Avg calories" value={`${weeklyAverageCalories}`} icon={TrendingDown} tone="green" />
          <IconTile label="Avg protein" value={`${weeklyAverageProtein}g`} icon={Activity} tone="blue" />
        </View>
        <Text style={styles.summaryCopy}>
          Protein is strongest on workout days and weakest after rice-heavy lunches. Next focus: add one 25g protein
          anchor to lunch and finish water before dinner.
        </Text>
      </Surface>

      <Surface>
        <SectionHeader title="Smart insights" />
        {data.insights.map((insight, index) => (
          <View key={insight.id} style={styles.insightWrap}>
            <View style={styles.insightRow}>
              <View style={[styles.insightMarker, markerStyle(insight.severity)]} />
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightBody}>{insight.body}</Text>
              </View>
            </View>
            {index !== data.insights.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </Surface>

      <Surface>
        <SectionHeader
          title="Google Fit"
          aside={<Pill label={data.profile.googleFitConnected ? 'Connected' : 'Mock sync'} selected tone="blue" />}
        />
        <View style={styles.summaryGrid}>
          <IconTile label="Steps" value={data.health.steps.toLocaleString()} icon={Activity} tone="blue" />
          <IconTile label="Sleep" value={`${data.health.sleepHours ?? 0}h`} icon={HeartPulse} tone="violet" />
        </View>
        <Text style={styles.mutedText}>
          Last sync {data.health.lastSyncedAt ? formatClock(data.health.lastSyncedAt) : 'not synced'}.
        </Text>
        <View style={styles.actions}>
          <PrimaryButton label="Sync now" icon={Activity} onPress={runHealthSync} />
          <QuietButton label={data.profile.googleFitConnected ? 'Disconnect' : 'Connect'} onPress={onToggleGoogleFit} />
        </View>
      </Surface>

      <View style={styles.summaryGrid}>
        <Surface style={styles.splitSurface}>
          <SectionHeader title="Budget" />
          <Text style={styles.bigValue}>₹{totalSpend}</Text>
          <Text style={styles.mutedText}>Outside food: ₹{outsideSpend}</Text>
          <Pill label="Budget recipes active" selected tone="amber" />
        </Surface>

        <Surface style={styles.splitSurface}>
          <SectionHeader title="Supplements" aside={<PillIcon color={colors.primary} size={19} />} />
          <Text style={styles.bigValue}>2/3</Text>
          <Text style={styles.mutedText}>Creatine and vitamin D marked today.</Text>
          <Pill label="No medical claims" selected tone="green" />
        </Surface>
      </View>

      <Surface>
        <SectionHeader title="Grocery scanner" aside={<Barcode color={colors.primary} size={21} />} />
        <TextField label="Barcode" value={barcode} onChangeText={setBarcode} keyboardType="number-pad" />
        <TextField label="Ingredients and nutrition" value={productLabel} onChangeText={setProductLabel} multiline />
        <View style={styles.actions}>
          <PrimaryButton label="Check product" icon={Barcode} onPress={checkProduct} />
          <QuietButton
            label="Clear"
            icon={ShieldAlert}
            onPress={() => {
              setBarcode('');
              setProductLabel('');
              setProductVerdict(null);
            }}
          />
        </View>
        {productVerdict ? <ProductVerdictCard verdict={productVerdict} /> : null}
      </Surface>

      <Surface>
        <SectionHeader title="Privacy & data" aside={<ShieldCheck color={colors.primary} size={21} />} />
        <View style={styles.privacyRows}>
          <PrivacyRow
            title="AI analysis"
            value={data.profile.aiAnalysisEnabled ? 'Enabled' : 'Disabled'}
            onPress={onToggleAi}
          />
          <PrivacyRow
            title="Meal photo saving"
            value={data.profile.photoSavingEnabled ? 'Enabled' : 'Disabled'}
            onPress={onTogglePhotoSaving}
          />
          <View style={styles.reminderPanel}>
            <View style={styles.privacyRow}>
              <View style={styles.privacyIcon}>
                <BellOff color={colors.primary} size={17} />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.privacyTitle}>Reminder controls</Text>
                <Text style={styles.mutedText}>Meal, water, fasting, protein, and weekly summary</Text>
              </View>
            </View>
            <View style={styles.reminderGrid}>
              {reminderItems.map((item) => {
                const enabled = data.profile.reminders[item.key];
                return (
                  <QuietButton
                    key={item.key}
                    label={`${item.label}: ${enabled ? 'On' : 'Off'}`}
                    onPress={() => onToggleReminder(item.key)}
                  />
                );
              })}
            </View>
          </View>
        </View>
        <View style={styles.disclaimer}>
          <ShieldAlert color={colors.amber} size={18} />
          <Text style={styles.disclaimerText}>
            This app provides general wellness and nutrition guidance. It is not a replacement for medical advice.
            Nutrition values and allergen detection are estimates.
          </Text>
        </View>
        {exportMessage ? <Text style={styles.exportMessage}>{exportMessage}</Text> : null}
        <View style={styles.actions}>
          <QuietButton label="Export" icon={Download} onPress={exportData} />
          <QuietButton label="Logout" icon={LogOut} onPress={onLogout} />
          <PrimaryButton label="Delete data" icon={Trash2} tone="danger" onPress={onDeleteAllData} />
        </View>
      </Surface>
    </AppScreen>
  );
};

const PrivacyRow = ({
  title,
  value,
  onPress,
}: {
  title: string;
  value: string;
  onPress: () => void;
}) => (
  <View style={styles.privacyRow}>
    <View style={styles.privacyIcon}>
      {title.includes('AI') ? (
        <Database color={colors.primary} size={17} />
      ) : title.includes('photo') ? (
        <ShieldCheck color={colors.primary} size={17} />
      ) : (
        <BellOff color={colors.primary} size={17} />
      )}
    </View>
    <View style={styles.insightText}>
      <Text style={styles.privacyTitle}>{title}</Text>
      <Text style={styles.mutedText}>{value}</Text>
    </View>
    <QuietButton label="Toggle" onPress={onPress} />
  </View>
);

const ProductVerdictCard = ({ verdict }: { verdict: PackagedFoodVerdict }) => {
  const tone = verdict.status === 'good' ? colors.primary : verdict.status === 'caution' ? colors.amber : colors.rose;

  return (
    <View style={[styles.productVerdict, { borderColor: tone }]}>
      <View style={styles.productVerdictTop}>
        <View style={[styles.scoreBadge, { backgroundColor: tone }]}>
          <Text style={styles.scoreText}>{verdict.score}</Text>
        </View>
        <View style={styles.insightText}>
          <Text style={styles.productTitle}>{verdict.title}</Text>
          <Text style={styles.mutedText}>{verdict.body}</Text>
        </View>
      </View>
      <View style={styles.flagList}>
        {verdict.flags.map((flag) => (
          <View key={flag} style={styles.flagRow}>
            <View style={[styles.flagDot, { backgroundColor: tone }]} />
            <Text style={styles.flagText}>{flag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const markerStyle = (severity: string) => {
  if (severity === 'watch') {
    return { backgroundColor: colors.amber };
  }
  if (severity === 'positive') {
    return { backgroundColor: colors.primary };
  }
  return { backgroundColor: colors.blue };
};

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCopy: {
    color: colors.ink,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: '700',
  },
  insightWrap: {
    gap: spacing.md,
  },
  insightRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  insightMarker: {
    width: 10,
    height: 42,
    borderRadius: 8,
  },
  insightText: {
    flex: 1,
    minWidth: 0,
  },
  insightTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '900',
  },
  insightBody: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  mutedText: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  splitSurface: {
    flex: 1,
    minWidth: 160,
  },
  bigValue: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  privacyRows: {
    gap: spacing.md,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '900',
  },
  reminderPanel: {
    gap: spacing.md,
  },
  reminderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  productVerdict: {
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  productVerdictTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  scoreBadge: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: colors.white,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  productTitle: {
    color: colors.ink,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  flagList: {
    gap: spacing.sm,
  },
  flagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  flagText: {
    flex: 1,
    color: colors.ink,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
  },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.amberSoft,
  },
  disclaimerText: {
    flex: 1,
    color: colors.ink,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '700',
  },
  exportMessage: {
    color: colors.primaryDark,
    backgroundColor: colors.mint,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '800',
  },
});
