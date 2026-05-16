import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ChefHat,
  Droplets,
  Home,
  LineChart,
  ScanLine,
  type LucideProps,
} from 'lucide-react-native';

import { colors, radii, shadows, spacing, typography } from '@/theme';

export type TabKey = 'home' | 'log' | 'cook' | 'fasting' | 'insights';

const tabs: Array<{
  key: TabKey;
  label: string;
  icon: React.ComponentType<LucideProps>;
}> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'log', label: 'Log', icon: ScanLine },
  { key: 'cook', label: 'Cook', icon: ChefHat },
  { key: 'fasting', label: 'Fast', icon: Droplets },
  { key: 'insights', label: 'Insights', icon: LineChart },
];

export const BottomNav = ({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) => (
  <View style={styles.wrap}>
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = tab.key === active;
        return (
          <Pressable
            accessibilityRole="button"
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [styles.item, selected && styles.itemActive, pressed && styles.pressed]}
          >
            <Icon color={selected ? colors.primary : colors.muted} size={20} strokeWidth={2.4} />
            <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  nav: {
    width: '100%',
    maxWidth: 760,
    minHeight: 66,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.faint,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    ...(shadows.card as object),
  },
  item: {
    flex: 1,
    minWidth: 0,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  itemActive: {
    backgroundColor: colors.mint,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: '800',
  },
  labelActive: {
    color: colors.primary,
  },
});
