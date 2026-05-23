-- Caliber — job ingestion (ATS catalog)

-- ─── Extend jobs catalog ─────────────────────────────────────────────────────

alter table public.jobs
  add column if not exists source text,
  add column if not exists external_id text,
  add column if not exists apply_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists raw_payload jsonb,
  add column if not exists synced_at timestamptz,
  add column if not exists job_source_id uuid;

create index if not exists jobs_is_active_idx on public.jobs (is_active);
create index if not exists jobs_source_external_idx on public.jobs (source, external_id);
create index if not exists jobs_job_source_id_idx on public.jobs (job_source_id);

-- ─── Curated ATS boards ───────────────────────────────────────────────────────

create table public.job_sources (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  provider text not null check (provider in ('greenhouse', 'lever', 'ashby')),
  board_token text not null,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique (provider, board_token)
);

alter table public.job_sources enable row level security;

-- Ingest runs with service role; authenticated users may read sources (future admin UI).
create policy "job_sources_select_authenticated"
  on public.job_sources for select
  to authenticated
  using (true);

alter table public.jobs
  add constraint jobs_job_source_id_fkey
  foreign key (job_source_id) references public.job_sources (id) on delete set null;

-- ─── Ingestion observability ─────────────────────────────────────────────────

create table public.job_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  sources_processed integer not null default 0,
  jobs_upserted integer not null default 0,
  jobs_deactivated integer not null default 0,
  error jsonb
);

alter table public.job_ingestion_runs enable row level security;

-- No user policies — service role only.
