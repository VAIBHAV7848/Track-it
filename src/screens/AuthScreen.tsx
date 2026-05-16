import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyRound, LockKeyhole, LogIn, ShieldCheck, Sparkles, UserPlus } from 'lucide-react-native';

import {
  AppLogo,
  AppScreen,
  IconTile,
  Pill,
  PrimaryButton,
  QuietButton,
  Surface,
  TextField,
} from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

type AuthMode = 'sign-in' | 'sign-up';

export const AuthScreen = ({
  onSubmit,
  onResetPassword,
  onLocalDemo,
  loading,
  message,
}: {
  onSubmit: (payload: { mode: AuthMode; email: string; password: string; name: string }) => void;
  onResetPassword: (email: string) => void;
  onLocalDemo: () => void;
  loading: boolean;
  message?: string;
}) => {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('Vaibhav');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AppScreen scroll={false}>
      <View style={styles.root}>
        <AppLogo />

        <Surface style={styles.hero}>
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.kicker}>Track It</Text>
              <Text style={styles.heroNumber}>AI</Text>
            </View>
            <View style={styles.rings}>
              <View style={[styles.ring, styles.ringGreen]} />
              <View style={[styles.ring, styles.ringBlue]} />
              <View style={[styles.ring, styles.ringAmber]} />
            </View>
          </View>
          <Text style={styles.heroTitle}>Personal nutrition, fasting, and cooking system.</Text>
          <Text style={styles.heroBody}>
            Supabase email login, private health records, AI meal estimates, and wellness-safe insights.
          </Text>
        </Surface>

        <View style={styles.tiles}>
          <IconTile label="Meal AI" value="Confirm first" icon={Sparkles} tone="violet" />
          <IconTile label="Privacy" value="RLS data" icon={ShieldCheck} tone="green" />
        </View>

        <Surface>
          <View style={styles.modeTabs}>
            <Pill label="Sign in" selected={mode === 'sign-in'} onPress={() => setMode('sign-in')} tone="green" />
            <Pill label="Create account" selected={mode === 'sign-up'} onPress={() => setMode('sign-up')} tone="blue" />
          </View>
          {mode === 'sign-up' ? <TextField label="Name" value={name} onChangeText={setName} /> : null}
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Minimum 6 characters"
          />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <PrimaryButton
            label={mode === 'sign-in' ? 'Sign in with email' : 'Create account'}
            icon={mode === 'sign-in' ? LogIn : UserPlus}
            onPress={() => onSubmit({ mode, email, password, name })}
            loading={loading}
          />
          <QuietButton label="Reset password" icon={KeyRound} onPress={() => onResetPassword(email)} />
          <QuietButton label="Use local demo" icon={ShieldCheck} onPress={onLocalDemo} />
        </Surface>

        <View style={styles.disclaimer}>
          <LockKeyhole color={colors.muted} size={16} />
          <Text style={styles.disclaimerText}>
            General wellness guidance only. Nutrition and allergen estimates must be verified manually.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  kicker: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  heroNumber: {
    color: colors.ink,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 0,
  },
  rings: {
    width: 106,
    height: 72,
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 10,
  },
  ringGreen: {
    right: 0,
    borderColor: colors.primary,
  },
  ringBlue: {
    right: 28,
    borderColor: colors.blue,
  },
  ringAmber: {
    right: 55,
    borderColor: colors.amber,
  },
  heroTitle: {
    color: colors.ink,
    fontSize: typography.h1,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroBody: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 21,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  message: {
    color: colors.primaryDark,
    backgroundColor: colors.mint,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: '800',
  },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
  },
});
