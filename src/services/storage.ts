import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppData, AuthUser } from '@/types';

const DATA_KEY = 'track-it/app-data';
const LOCAL_AUTH_KEY = 'track-it/local-auth-user';

export const loadLocalAuth = async (): Promise<AuthUser | null> => {
  const raw = await AsyncStorage.getItem(LOCAL_AUTH_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const saveLocalAuth = async (user: AuthUser | null) => {
  if (!user) {
    await AsyncStorage.removeItem(LOCAL_AUTH_KEY);
    return;
  }
  await AsyncStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
};

export const loadStoredData = async (): Promise<AppData | null> => {
  const raw = await AsyncStorage.getItem(DATA_KEY);
  return raw ? (JSON.parse(raw) as AppData) : null;
};

export const saveStoredData = async (data: AppData) => {
  await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
};

export const clearStoredData = async () => {
  await AsyncStorage.multiRemove([DATA_KEY, LOCAL_AUTH_KEY]);
};
