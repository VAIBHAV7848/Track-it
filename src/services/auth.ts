import type { User } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';
import type { AuthUser } from '@/types';

export type AuthResult = {
  user: AuthUser | null;
  requiresEmailConfirmation: boolean;
};

const mapUser = (user: User): AuthUser => ({
  id: user.id,
  name:
    typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()
      ? user.user_metadata.name
      : user.email?.split('@')[0] ?? 'Track It user',
  email: user.email ?? '',
  photoUrl: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined,
});

export const getCurrentAuthUser = async (): Promise<AuthUser | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return mapUser(data.user);
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user ? mapUser(data.user) : null,
    requiresEmailConfirmation: false,
  };
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name: name.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.session && data.user ? mapUser(data.user) : null,
    requiresEmailConfirmation: !data.session,
  };
};

export const sendPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) {
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const deleteAccount = async () => {
  const { error } = await supabase.functions.invoke('delete-account');
  if (error) {
    throw new Error(error.message);
  }
  await supabase.auth.signOut();
};
