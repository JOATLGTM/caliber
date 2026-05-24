# Deploying Caliber to Vercel

## Prerequisites

- Supabase project with all migrations applied (`caliber/supabase/migrations/`)
- Git repo connected to Vercel (root directory: **`caliber/`**)

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Production value |
|----------|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role (server only) |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://your-domain.vercel.app` |
| `CRON_SECRET` | Yes | Random string (32+ chars). Vercel Cron sends `Authorization: Bearer <this>` |
| `SEED_DEMO_DATA` | Yes | `false` |
| `OPENAI_API_KEY` | Optional | Enables live AI tailoring |
| `STRIPE_*` | Optional | Billing |

Generate a cron secret:

```bash
openssl rand -hex 32
```

## Cron (job ingest)

[`vercel.json`](vercel.json) schedules `GET /api/cron/ingest-jobs` every **8 hours**.

After first deploy:

1. Confirm `CRON_SECRET` is set on Vercel (Production).
2. In Vercel → Project → Cron Jobs, verify the schedule appears.
3. Trigger manually:

```bash
curl -X POST "https://YOUR_DOMAIN/api/cron/ingest-jobs" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expect `{"ok":true,"sourcesProcessed":21,...}`.

## Supabase OAuth redirect

In Supabase → Authentication → URL configuration, add:

- Site URL: `https://YOUR_DOMAIN`
- Redirect URLs: `https://YOUR_DOMAIN/auth/callback`

## Chrome extension (apply autofill)

See [`extension/README.md`](extension/README.md). Users connect from **Settings → Browser extension**.

Set `NEXT_PUBLIC_SITE_URL` so the extension API CORS allows your production origin.

## Post-deploy checklist

- [ ] Sign up / log in on production
- [ ] Upload resume (PDF or DOCX)
- [ ] Dashboard shows ingested jobs (not mock catalog)
- [ ] Cron run succeeds (check response or `job_ingestion_runs` table)
- [ ] Stripe webhook URL updated if using billing
