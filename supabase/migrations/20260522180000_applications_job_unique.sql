-- Phase 3: one application row per user per ingested job.
create unique index if not exists applications_user_job_unique_idx
  on public.applications (user_id, job_id)
  where job_id is not null;
