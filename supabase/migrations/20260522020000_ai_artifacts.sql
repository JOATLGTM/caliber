-- T2.4 — AI artifacts: tailored resumes, cover letters, match scores, plans.

-- 1) Resumes: store the diff JSON + quality breakdown for tailored versions.
alter table public.resumes
  add column if not exists job_id text references public.jobs (id) on delete set null,
  add column if not exists diff jsonb,
  add column if not exists quality_score integer,
  add column if not exists quality_breakdown jsonb;

create index if not exists resumes_user_job_idx
  on public.resumes (user_id, job_id);

-- 2) Cover letters: link to job + index by user.
alter table public.cover_letters
  add column if not exists model text;

create index if not exists cover_letters_user_job_idx
  on public.cover_letters (user_id, job_id);

-- 3) user_jobs: cache why-match bullets (computed alongside match_score).
alter table public.user_jobs
  add column if not exists why_match text[] not null default '{}',
  add column if not exists scored_at timestamptz;

-- 4) Profile: subscription plan (used by T3.4 billing).
alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id);

-- 5) profiles: store extracted resume text (used by T2.3 parsing follow-up + T2.4 prompts)
alter table public.profiles
  add column if not exists resume_text text;
