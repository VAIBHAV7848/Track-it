import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { BottomNav, type TabKey } from '@/components/BottomNav';
import { AppLogo } from '@/components/ui';
import { createSeedData, demoUser } from '@/data/mockData';
import {
  deleteAccount,
  getCurrentAuthUser,
  sendPasswordReset,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '@/services/auth';
import {
  createInitialAppData,
  deleteRemoteUserData,
  loadAppData,
  saveAppData,
} from '@/services/database';
import {
  clearStoredData,
  loadLocalAuth,
  loadStoredData,
  saveLocalAuth,
  saveStoredData,
} from '@/services/storage';
import { AuthScreen } from '@/screens/AuthScreen';
import { CookScreen } from '@/screens/CookScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { FastingHydrationScreen } from '@/screens/FastingHydrationScreen';
import { InsightsScreen } from '@/screens/InsightsScreen';
import { LogScreen } from '@/screens/LogScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { colors, spacing, typography } from '@/theme';
import type {
  AppData,
  AuthUser,
  FastingSession,
  HealthSnapshot,
  MealLog,
  Recipe,
  ReminderPreferences,
  UserProfile,
} from '@/types';
import { toIsoDate } from '@/utils/dates';
import { targetForGoal } from '@/utils/nutrition';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string>();
  const [syncMessage, setSyncMessage] = useState<string>();
  const [localMode, setLocalMode] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const localUser = await loadLocalAuth();
      if (localUser) {
        const storedData = await loadStoredData();
        setLocalMode(true);
        setAuthUser(localUser);
        setData(storedData ?? createSeedData(localUser));
        setBooting(false);
        return;
      }

      const user = await getCurrentAuthUser();
      setAuthUser(user);

      if (user) {
        try {
          const remoteData = await loadAppData(user);
          setData(remoteData);
        } catch (error) {
          const storedData = await loadStoredData();
          setData(storedData);
          setSyncMessage(error instanceof Error ? error.message : 'Unable to load Supabase data.');
        }
      }

      setBooting(false);
    };
    boot();
  }, []);

  useEffect(() => {
    if (!booting && data) {
      saveStoredData(data);
      if (localMode) {
        return;
      }
      saveAppData(data).catch((error: unknown) => {
        setSyncMessage(error instanceof Error ? error.message : 'Unable to sync Supabase data.');
      });
    }
  }, [booting, data, localMode]);

  const login = async ({
    mode,
    email,
    password,
    name,
  }: {
    mode: 'sign-in' | 'sign-up';
    email: string;
    password: string;
    name: string;
  }) => {
    if (!email.trim() || !password.trim()) {
      setAuthMessage('Enter email and password.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage(undefined);
    try {
      const result =
        mode === 'sign-in'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password, name || (email.split('@')[0] ?? 'Track It user'));

      if (result.requiresEmailConfirmation) {
        setAuthMessage('Check your email to confirm the account, then sign in.');
        return;
      }

      if (result.user) {
        setAuthUser(result.user);
        try {
          setData(await loadAppData(result.user));
        } catch (error) {
          setData(null);
          setSyncMessage(error instanceof Error ? error.message : 'Unable to load Supabase data.');
        }
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      setAuthMessage('Enter your email first.');
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordReset(email);
      setAuthMessage('Password reset email sent.');
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Password reset failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const useLocalDemo = async () => {
    const storedData = await loadStoredData();
    const nextData = storedData ?? createSeedData(demoUser);
    setLocalMode(true);
    setSyncMessage(undefined);
    setAuthMessage(undefined);
    setAuthUser(demoUser);
    setData(nextData);
    await saveLocalAuth(demoUser);
    await saveStoredData(nextData);
    setActiveTab('home');
  };

  const completeOnboarding = async (profile: UserProfile) => {
    if (!authUser) {
      return;
    }
    const nextData = createInitialAppData(authUser, profile);
    setData(nextData);
    if (localMode) {
      await saveStoredData(nextData);
      setActiveTab('home');
      return;
    }
    try {
      await saveAppData(nextData);
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : 'Unable to save Supabase data.');
    }
    setActiveTab('home');
  };

  const updateData = (updater: (current: AppData) => AppData) => {
    setData((current) => (current ? updater(current) : current));
  };

  const addMeal = (meal: MealLog) => {
    updateData((current) => ({
      ...current,
      meals: [meal, ...current.meals],
    }));
  };

  const addWater = (amountMl: number) => {
    updateData((current) => ({
      ...current,
      hydrationLogs: [
        { id: `water-${Date.now()}`, amountMl, createdAt: new Date().toISOString() },
        ...current.hydrationLogs,
      ],
    }));
  };

  const startFast = (plan: string) => {
    const session: FastingSession = {
      id: `fast-${Date.now()}`,
      plan,
      startTime: new Date().toISOString(),
      hungerLevel: 2,
      energy: 'medium',
      mood: 'steady',
    };
    updateData((current) => ({
      ...current,
      fastingSessions: [session, ...current.fastingSessions.map((item) => ({ ...item, endTime: item.endTime ?? new Date().toISOString() }))],
    }));
  };

  const endFast = (sessionId: string) => {
    updateData((current) => ({
      ...current,
      fastingSessions: current.fastingSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              endTime: new Date().toISOString(),
              notes: 'Completed from tracker',
            }
          : session,
      ),
    }));
  };

  const addWeight = (weightKg: number) => {
    if (!weightKg) {
      return;
    }
    const today = toIsoDate();
    updateData((current) => ({
      ...current,
      profile: { ...current.profile, weightKg },
      targets: targetForGoal(current.profile.goal, weightKg),
      weightLogs: [
        ...current.weightLogs.filter((log) => log.date !== today),
        { id: `weight-${today}`, weightKg, date: today },
      ],
    }));
  };

  const addRecipe = (recipe: Recipe) => {
    updateData((current) => ({ ...current, recipes: [recipe, ...current.recipes] }));
  };

  const toggleRecipeSaved = (recipeId: string) => {
    updateData((current) => ({
      ...current,
      recipes: current.recipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, saved: !recipe.saved } : recipe,
      ),
    }));
  };

  const applyHealthSync = (health: HealthSnapshot) => {
    updateData((current) => ({
      ...current,
      health,
      profile: { ...current.profile, googleFitConnected: true },
    }));
  };

  const toggleReminder = (key: keyof ReminderPreferences) => {
    updateData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        reminders: {
          ...current.profile.reminders,
          [key]: !current.profile.reminders[key],
        },
      },
    }));
  };

  const logout = async () => {
    if (!localMode) {
      await signOut();
    }
    await clearStoredData();
    setLocalMode(false);
    setAuthUser(null);
    setData(null);
    setActiveTab('home');
  };

  const deleteAllData = async () => {
    if (!authUser) {
      return;
    }

    if (localMode) {
      await clearStoredData();
      setLocalMode(false);
      setAuthUser(null);
      setData(null);
      setActiveTab('home');
      return;
    }

    try {
      await deleteAccount();
    } catch {
      await deleteRemoteUserData(authUser.id);
      await signOut();
    } finally {
      await clearStoredData();
      setAuthUser(null);
      setData(null);
      setActiveTab('home');
    }
  };

  const shell = useMemo(() => {
    if (!data) {
      return null;
    }

    switch (activeTab) {
      case 'log':
        return <LogScreen meals={data.meals} savedMeals={data.savedMeals} onAddMeal={addMeal} />;
      case 'cook':
        return (
          <CookScreen
            profile={data.profile}
            recipes={data.recipes}
            onAddRecipe={addRecipe}
            onToggleSaved={toggleRecipeSaved}
          />
        );
      case 'fasting':
        return (
          <FastingHydrationScreen
            waterTargetMl={data.targets.waterMl}
            hydrationLogs={data.hydrationLogs}
            fastingSessions={data.fastingSessions}
            weightLogs={data.weightLogs}
            reminders={data.profile.reminders}
            steps={data.health.steps}
            onAddWater={addWater}
            onStartFast={startFast}
            onEndFast={endFast}
            onAddWeight={addWeight}
          />
        );
      case 'insights':
        return (
          <InsightsScreen
            data={data}
            onHealthSync={applyHealthSync}
            onToggleGoogleFit={() =>
              updateData((current) => ({
                ...current,
                profile: { ...current.profile, googleFitConnected: !current.profile.googleFitConnected },
              }))
            }
            onToggleAi={() =>
              updateData((current) => ({
                ...current,
                profile: { ...current.profile, aiAnalysisEnabled: !current.profile.aiAnalysisEnabled },
              }))
            }
            onTogglePhotoSaving={() =>
              updateData((current) => ({
                ...current,
                profile: { ...current.profile, photoSavingEnabled: !current.profile.photoSavingEnabled },
              }))
            }
            onToggleReminder={toggleReminder}
            onLogout={logout}
            onDeleteAllData={deleteAllData}
          />
        );
      default:
        return (
          <DashboardScreen
            data={data}
            onGoLog={() => setActiveTab('log')}
            onGoCook={() => setActiveTab('cook')}
            onGoFast={() => setActiveTab('fasting')}
            onAddWater={addWater}
          />
        );
    }
  }, [activeTab, data]);

  if (booting) {
    return (
      <View style={styles.splash}>
        <AppLogo />
        <Text style={styles.splashText}>Loading your day</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!authUser) {
    return (
      <>
        <AuthScreen
          onSubmit={login}
          onResetPassword={resetPassword}
          onLocalDemo={useLocalDemo}
          loading={authLoading}
          message={authMessage}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <OnboardingScreen user={authUser} onComplete={completeOnboarding} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <View style={styles.app}>
      {shell}
      {syncMessage ? (
        <View style={styles.syncBanner}>
          <Text style={styles.syncText} numberOfLines={2}>
            Supabase sync issue: {syncMessage}
          </Text>
        </View>
      ) : null}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  splashText: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: '800',
  },
  syncBanner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 92,
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: colors.amberSoft,
    borderColor: '#F1D59A',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  syncText: {
    color: colors.amber,
    fontSize: typography.small,
    fontWeight: '800',
  },
});
