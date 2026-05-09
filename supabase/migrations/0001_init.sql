-- PawStreak schema (initial)
-- Idempotent: safe to re-run during early development.
--
-- Strategy:
--   * profiles  — minimal owner profile keyed to auth.users.id
--   * app_state — single JSON blob of PawstreakState per user (fast iteration,
--                 lets us reshape app state without DB migrations every time).
--   * adventures — normalized log of completed adventures for analytics/leaderboards
--                  later. Mirrors the JSON entries written by the client; we'll
--                  hydrate from it once we want server-side aggregations.
--
-- Row-Level Security: enabled on every table. Users can only read/write their own.

-------------------------------------------------------------------------------
-- profiles
-------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-------------------------------------------------------------------------------
-- app_state (PawstreakState JSON blob, 1:1 with user)
-------------------------------------------------------------------------------
create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "app_state_select_self" on public.app_state;
create policy "app_state_select_self"
  on public.app_state for select
  using (auth.uid() = user_id);

drop policy if exists "app_state_insert_self" on public.app_state;
create policy "app_state_insert_self"
  on public.app_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "app_state_update_self" on public.app_state;
create policy "app_state_update_self"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- adventures (normalized log for future analytics/leaderboards)
-------------------------------------------------------------------------------
create table if not exists public.adventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text,                 -- AdventureEntry.id from the client (idempotency)
  mission_title text not null,
  emoji text,
  vibe text,
  rarity text,
  category text,
  adventure_xp integer not null default 0,
  duration_minutes integer not null default 0,
  ground_covered numeric not null default 0,
  location_hint text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.adventures enable row level security;

drop policy if exists "adventures_select_self" on public.adventures;
create policy "adventures_select_self"
  on public.adventures for select
  using (auth.uid() = user_id);

drop policy if exists "adventures_insert_self" on public.adventures;
create policy "adventures_insert_self"
  on public.adventures for insert
  with check (auth.uid() = user_id);

create index if not exists adventures_user_completed_idx
  on public.adventures (user_id, completed_at desc);

-------------------------------------------------------------------------------
-- updated_at triggers
-------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_app_state_updated_at on public.app_state;
create trigger trg_app_state_updated_at
  before update on public.app_state
  for each row execute procedure public.set_updated_at();

-------------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
