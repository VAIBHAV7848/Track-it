export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://yqauztyysvnxmhadzraw.supabase.co',
  supabasePublishableKey:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    'sb_publishable_vDdNbYVjNY0v75kb-W1wjQ_HTK4cpq9',
};

export const assertPublicEnv = () => {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error('Missing Supabase public configuration.');
  }
};
