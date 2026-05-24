-- User-added manual jobs (private to owner)

alter table public.jobs
  add column if not exists owner_user_id uuid references auth.users (id) on delete cascade;

create index if not exists jobs_owner_user_id_idx on public.jobs (owner_user_id);

create policy "jobs_insert_manual_own"
  on public.jobs for insert
  to authenticated
  with check (source = 'manual' and owner_user_id = auth.uid());
