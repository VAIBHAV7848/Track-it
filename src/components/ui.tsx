import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Check, type LucideProps } from 'lucide-react-native';

import { colors, radii, shadows, spacing, typography } from '@/theme';

type IconType = React.ComponentType<LucideProps>;

export const AppScreen = ({
  children,
  title,
  subtitle,
  action,
  scroll = true,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  scroll?: boolean;
}>) => {
  const body = (
    <View style={styles.screenInner}>
      {(title || subtitle || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
            {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const Surface = ({
  children,
  style,
  muted = false,
}: PropsWithChildren<{ style?: ViewStyle; muted?: boolean }>) => (
  <View style={[styles.surface, muted && styles.surfaceMuted, style]}>{children}</View>
);

export const SectionHeader = ({
  title,
  aside,
}: {
  title: string;
  aside?: ReactNode;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {aside}
  </View>
);

export const PrimaryButton = ({
  label,
  icon: Icon,
  onPress,
  tone = 'primary',
  disabled = false,
  loading = false,
}: {
  label: string;
  icon?: IconType;
  onPress: () => void;
  tone?: 'primary' | 'dark' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [
      styles.primaryButton,
      tone === 'dark' && styles.primaryButtonDark,
      tone === 'danger' && styles.primaryButtonDanger,
      (pressed || disabled) && styles.buttonPressed,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={colors.white} size="small" />
    ) : Icon ? (
      <Icon color={colors.white} size={18} strokeWidth={2.4} />
    ) : null}
    <Text style={styles.primaryButtonText} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

export const QuietButton = ({
  label,
  icon: Icon,
  onPress,
}: {
  label: string;
  icon?: IconType;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.quietButton, pressed && styles.buttonPressed]}
  >
    {Icon ? <Icon color={colors.primary} size={17} strokeWidth={2.3} /> : null}
    <Text style={styles.quietButtonText} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

export const IconTile = ({
  label,
  value,
  icon: Icon,
  tone = 'green',
  onPress,
}: {
  label: string;
  value: string;
  icon: IconType;
  tone?: 'green' | 'blue' | 'amber' | 'rose' | 'violet';
  onPress?: () => void;
}) => {
  const toneStyle = toneStyles[tone];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.metricCard, pressed && onPress && styles.buttonPressed]}
    >
      <View style={[styles.iconBadge, toneStyle.badge]}>
        <Icon color={toneStyle.icon} size={19} strokeWidth={2.3} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Pressable>
  );
};

export const ProgressBar = ({
  value,
  tint = colors.primary,
}: {
  value: number;
  tint?: string;
}) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${Math.round(value * 100)}%`, backgroundColor: tint }]} />
  </View>
);

export const Pill = ({
  label,
  selected = false,
  onPress,
  tone = 'green',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'green' | 'blue' | 'amber' | 'rose' | 'violet';
}) => {
  const toneStyle = toneStyles[tone];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected && { backgroundColor: toneStyle.soft, borderColor: toneStyle.icon },
        pressed && onPress && styles.buttonPressed,
      ]}
    >
      {selected ? <Check color={toneStyle.icon} size={14} strokeWidth={2.6} /> : null}
      <Text style={[styles.pillText, selected && { color: toneStyle.icon }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

export const TextField = ({
  label,
  value,
  onChangeText,
  multiline,
  ...props
}: TextInputProps & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.muted}
      multiline={multiline}
      style={[styles.textInput, multiline && styles.textArea]}
      {...props}
    />
  </View>
);

export const Divider = () => <View style={styles.divider} />;

export const AppLogo = ({ compact = false }: { compact?: boolean }) => (
  <View style={[styles.logoWrap, compact && styles.logoWrapCompact]}>
    <View style={[styles.logoMark, compact && styles.logoMarkCompact]}>
      <Text style={[styles.logoMarkText, compact && styles.logoMarkTextCompact]}>T</Text>
    </View>
    {!compact ? (
      <View>
        <Text style={styles.logoText}>Track It</Text>
        <Text style={styles.logoSubtext}>AI nutrition companion</Text>
      </View>
    ) : null}
  </View>
);

export const EmptyState = ({
  title,
  body,
}: {
  title: string;
  body: string;
}) => (
  <Surface muted>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyBody}>{body}</Text>
  </Surface>
);

const toneStyles = {
  green: { badge: { backgroundColor: colors.mint }, icon: colors.primary, soft: colors.mint },
  blue: { badge: { backgroundColor: colors.blueSoft }, icon: colors.blue, soft: colors.blueSoft },
  amber: { badge: { backgroundColor: colors.amberSoft }, icon: colors.amber, soft: colors.amberSoft },
  rose: { badge: { backgroundColor: colors.roseSoft }, icon: colors.rose, soft: colors.roseSoft },
  violet: { badge: { backgroundColor: colors.violetSoft }, icon: colors.violet, soft: colors.violetSoft },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 96,
  },
  screenInner: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: typography.h1,
    fontWeight: '800',
    letterSpacing: 0,
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.faint,
    padding: spacing.lg,
    gap: spacing.md,
    ...(shadows.card as object),
  },
  surfaceMuted: {
    backgroundColor: colors.surfaceAlt,
    shadowOpacity: 0,
    elevation: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
    letterSpacing: 0,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonDark: {
    backgroundColor: colors.black,
  },
  primaryButtonDanger: {
    backgroundColor: colors.rose,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '800',
  },
  quietButton: {
    minHeight: 42,
    borderRadius: radii.md,
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#C7E8D8',
  },
  quietButtonText: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.72,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.faint,
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '900',
    letterSpacing: 0,
  },
  progressTrack: {
    height: 9,
    borderRadius: radii.pill,
    backgroundColor: '#E8ECEA',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  pill: {
    minHeight: 36,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.faint,
    backgroundColor: colors.surface,
  },
  pillText: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '800',
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '800',
  },
  textInput: {
    minHeight: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.faint,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: typography.body,
  },
  textArea: {
    minHeight: 92,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: colors.faint,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoWrapCompact: {
    gap: 0,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkCompact: {
    width: 38,
    height: 38,
  },
  logoMarkText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '900',
  },
  logoMarkTextCompact: {
    fontSize: 20,
  },
  logoText: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: '900',
    letterSpacing: 0,
  },
  logoSubtext: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: '700',
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 20,
  },
});
