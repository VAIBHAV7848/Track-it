create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  age integer not null check (age between 10 and 120),
  gender text not null,
  height_cm numeric not null check (height_cm > 0),
  weight_kg numeric not null check (weight_kg > 0),
  target_weight_kg numeric,
  goal text not null,
  diet_preference text not null,
  allergies text[] not null default '{}',
  activity_level text not null check (activity_level in ('low', 'moderate', 'high')),
  reminders jsonb not null default '{"meals":true,"water":true,"fasting":true,"protein":true,"weeklySummary":true}'::jsonb,
  google_fit_connected boolean not null default false,
  ai_analysis_enabled boolean not null default true,
  photo_saving_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_targets (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  fiber integer not null default 0,
  sugar integer not null default 0,
  sodium integer not null default 0,
  water_ml integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  meal_name text not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  quantity text not null,
  source text not null check (source in ('manual', 'scan', 'voice', 'saved')),
  photo_url text,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  fiber integer not null default 0,
  sugar integer not null default 0,
  sodium integer not null default 0,
  cost numeric,
  mood text,
  gut_reaction text,
  allergens text[] not null default '{}',
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  verdict text not null default '',
  is_favorite boolean not null default false,
  is_outside_food boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_meals (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null,
  default_serving text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  fiber integer not null default 0,
  sugar integer not null default 0,
  sodium integer not null default 0,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null,
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  calories integer not null default 0,
  protein integer not null default 0,
  cooking_time_minutes integer not null default 0,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  goal_tag text not null default '',
  budget text not null check (budget in ('low', 'medium', 'high')),
  saved boolean not null default false,
  rating integer check (rating is null or rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fasting_sessions (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  plan text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  mood text,
  hunger_level integer check (hunger_level is null or hunger_level between 1 and 5),
  energy text check (energy is null or energy in ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hydration_logs (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.weight_logs (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  weight_kg numeric not null check (weight_kg > 0),
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.health_snapshots (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  steps integer not null default 0,
  active_minutes integer not null default 0,
  calories_burned integer not null default 0,
  heart_rate integer,
  sleep_hours numeric,
  last_synced_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_insights (
  id text primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null,
  body text not null,
  severity text not null check (severity in ('positive', 'watch', 'neutral')),
  created_at timestamptz not null default now()
);

create index if not exists meals_user_created_idx on public.meals(user_id, created_at desc);
create index if not exists fasting_user_start_idx on public.fasting_sessions(user_id, start_time desc);
create index if not exists hydration_user_created_idx on public.hydration_logs(user_id, created_at desc);
create index if not exists weight_user_date_idx on public.weight_logs(user_id, date);
create index if not exists insights_user_created_idx on public.weekly_insights(user_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists nutrition_targets_set_updated_at on public.nutrition_targets;
create trigger nutrition_targets_set_updated_at before update on public.nutrition_targets
for each row execute function public.set_updated_at();

drop trigger if exists meals_set_updated_at on public.meals;
create trigger meals_set_updated_at before update on public.meals
for each row execute function public.set_updated_at();

drop trigger if exists saved_meals_set_updated_at on public.saved_meals;
create trigger saved_meals_set_updated_at before update on public.saved_meals
for each row execute function public.set_updated_at();

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at before update on public.recipes
for each row execute function public.set_updated_at();

drop trigger if exists fasting_sessions_set_updated_at on public.fasting_sessions;
create trigger fasting_sessions_set_updated_at before update on public.fasting_sessions
for each row execute function public.set_updated_at();

drop trigger if exists health_snapshots_set_updated_at on public.health_snapshots;
create trigger health_snapshots_set_updated_at before update on public.health_snapshots
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.nutrition_targets enable row level security;
alter table public.meals enable row level security;
alter table public.saved_meals enable row level security;
alter table public.recipes enable row level security;
alter table public.fasting_sessions enable row level security;
alter table public.hydration_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.health_snapshots enable row level security;
alter table public.weekly_insights enable row level security;

create policy "profiles_owner_all" on public.profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "nutrition_targets_owner_all" on public.nutrition_targets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals_owner_all" on public.meals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_meals_owner_all" on public.saved_meals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recipes_owner_all" on public.recipes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fasting_sessions_owner_all" on public.fasting_sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "hydration_logs_owner_all" on public.hydration_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weight_logs_owner_all" on public.weight_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "health_snapshots_owner_all" on public.health_snapshots
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weekly_insights_owner_all" on public.weekly_insights
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meal-photos',
  'meal-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "meal_photos_owner_select" on storage.objects
for select using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "meal_photos_owner_insert" on storage.objects
for insert with check (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "meal_photos_owner_update" on storage.objects
for update using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "meal_photos_owner_delete" on storage.objects
for delete using (
  bucket_id = 'meal-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
