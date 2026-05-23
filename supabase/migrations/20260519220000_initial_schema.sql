-- Caliber T2.2 — initial schema + RLS

-- ─── profiles ───────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  location text not null default '',
  target_roles text[] not null default '{}',
  preferred_locations text[] not null default '{}',
  work_modes jsonb not null default '{"remote":false,"hybrid":false,"onsite":false}'::jsonb,
  salary_min integer not null default 0,
  salary_target integer not null default 0,
  experience_level text not null default 'Mid',
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user ();

-- ─── jobs (shared catalog) ──────────────────────────────────────────────────

create table public.jobs (
  id text primary key,
  company text not null,
  title text not null,
  location text not null,
  work_mode text not null,
  salary text not null,
  salary_min integer not null,
  match_score integer not null,
  posted_at date not null,
  seniority text not null,
  field text not null,
  skills text[] not null default '{}',
  nice_to_haves text[] not null default '{}',
  why_match text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "jobs_select_authenticated"
  on public.jobs for select
  to authenticated
  using (true);

-- ─── user_jobs ──────────────────────────────────────────────────────────────

create table public.user_jobs (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null references public.jobs (id) on delete cascade,
  saved boolean not null default false,
  dismissed boolean not null default false,
  match_score integer,
  primary key (user_id, job_id)
);

alter table public.user_jobs enable row level security;

create policy "user_jobs_select_own"
  on public.user_jobs for select
  using (auth.uid() = user_id);

create policy "user_jobs_insert_own"
  on public.user_jobs for insert
  with check (auth.uid() = user_id);

create policy "user_jobs_update_own"
  on public.user_jobs for update
  using (auth.uid() = user_id);

create policy "user_jobs_delete_own"
  on public.user_jobs for delete
  using (auth.uid() = user_id);

-- ─── applications ───────────────────────────────────────────────────────────

create table public.applications (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text references public.jobs (id) on delete set null,
  company text not null,
  title text not null,
  status text not null,
  outcome text,
  match_score integer not null,
  applied_at date,
  salary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications (user_id);

alter table public.applications enable row level security;

create policy "applications_select_own"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "applications_update_own"
  on public.applications for update
  using (auth.uid() = user_id);

create policy "applications_delete_own"
  on public.applications for delete
  using (auth.uid() = user_id);

-- ─── resumes ────────────────────────────────────────────────────────────────

create table public.resumes (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_base boolean not null default false,
  job_title text,
  company text,
  match_score_at_time integer,
  storage_path text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

create policy "resumes_all_own"
  on public.resumes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── cover_letters ──────────────────────────────────────────────────────────

create table public.cover_letters (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text references public.jobs (id) on delete set null,
  company text not null,
  job_title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cover_letters enable row level security;

create policy "cover_letters_all_own"
  on public.cover_letters
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── onboarding_state ───────────────────────────────────────────────────────

create table public.onboarding_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  step integer not null default 1,
  resume_uploaded_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.onboarding_state enable row level security;

create policy "onboarding_all_own"
  on public.onboarding_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── updated_at trigger ─────────────────────────────────────────────────────

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at ();

create trigger applications_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at ();
