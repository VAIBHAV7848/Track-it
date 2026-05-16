import { corsHeaders, json } from '../_shared/cors.ts';
import { createAdminClient, createUserClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authorization = req.headers.get('Authorization') ?? '';
    const userClient = createUserClient(authorization);
    const {
      data: { user },
      error,
    } = await userClient.auth.getUser();

    if (error || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return json({ error: deleteError.message }, 500);
    }

    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown account deletion error';
    return json({ error: message }, 500);
  }
});
