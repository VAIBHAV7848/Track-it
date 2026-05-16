import { createClient } from 'npm:@supabase/supabase-js@2';

export const getPublishableKey = () => {
  const modern = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (modern) {
    const parsed = JSON.parse(modern) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0];
  }
  return Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
};

export const getSecretKey = () => {
  const modern = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (modern) {
    const parsed = JSON.parse(modern) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0];
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
};

export const createUserClient = (authorization: string) => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = getPublishableKey();
  if (!url || !key) {
    throw new Error('Supabase public environment is missing.');
  }
  return createClient(url, key, {
    global: {
      headers: { Authorization: authorization },
    },
  });
};

export const createAdminClient = () => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = getSecretKey();
  if (!url || !key) {
    throw new Error('Supabase secret environment is missing.');
  }
  return createClient(url, key);
};
