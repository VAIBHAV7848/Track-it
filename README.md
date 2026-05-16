# Track It

Android-first personal AI health and nutrition app built from `prd.md`.

## Stack

- Expo React Native + TypeScript
- Supabase Auth with email/password login
- Supabase Postgres with Row Level Security
- Supabase Storage for private meal photos
- Supabase Edge Functions for OpenAI calls and account deletion
- AsyncStorage as an offline cache

Flutter was the PRD recommendation, but Flutter/Dart are not installed in this workspace. React Native is also allowed by the PRD and runs here immediately.

## Run

```bash
npm install
npm run web
```

For Android:

```bash
npm run android
```

## Supabase Setup

The mobile client uses only public Supabase config:

```bash
cp .env.example .env.local
```

Deploy backend schema and functions:

```bash
npx supabase login
npx supabase link --project-ref yqauztyysvnxmhadzraw
npx supabase db push
npx supabase functions deploy ai-assistant
npx supabase functions deploy delete-account
```

Set OpenAI only as a Supabase secret:

```bash
npx supabase secrets set --env-file supabase/.env --project-ref yqauztyysvnxmhadzraw
```

Do not put `sb_secret_*` or `OPENAI_API_KEY` in the Expo app.

## Current MVP

- Supabase email sign-in, sign-up, password reset, and sign-out
- Onboarding for body details, goals, diet, allergies, activity, Google Fit preference, and reminders
- Home dashboard with calories, protein, water, fasting, steps, streaks, and smart suggestion
- Meal scanner flow with image picker, Supabase Edge Function AI call, confirmation, and journal save
- Manual meal logging with macros, cost, mood, and gut reaction
- Voice meal parsing through the same AI function, with safe local fallback
- Saved meals and meal journal
- Cook assistant with AI recipe generation, saved recipes, ratings, and grocery list
- Fasting timer, plan selection, streak signal, hydration intelligence, and weight tracking
- Weekly insights, Google Fit mock sync, budget, supplements, packaged-food label checker, reminder toggles, privacy controls, export/logout/delete actions

## Production Wiring

Implemented backend/client seams:

- `auth.ts`: Supabase email auth.
- `database.ts`: typed Supabase persistence for profile, meals, recipes, fasting, hydration, weight, health, and insights.
- `ai.ts`: calls `ai-assistant`, then falls back locally if the function is unavailable.
- `health.ts`: connect Android Health Connect for steps, workouts, calories, heart rate, and sleep.
- `notifications.ts`: schedule native reminders for meals, hydration, fasting, protein, and weekly summaries.

Security notes:

- RLS policies are in `supabase/migrations/20260516150000_initial_track_it_schema.sql`.
- Meal photos go in a private `meal-photos` bucket scoped by user ID folder.
- Account deletion uses an Edge Function because deleting Auth users requires a server-side secret key.
