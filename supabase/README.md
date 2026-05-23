# Supabase setup (Caliber T2.2)

## 1. Run the migration

In the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new), paste and run:

`migrations/20260519220000_initial_schema.sql`

## 2. Service role key

Copy **Project Settings → API → service_role** into `caliber/.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Required for seeding the job catalog and demo rows on first app load.

## 3. Email signup — no custom mailer in Caliber

Caliber does **not** send confirmation emails itself. Supabase Auth does — using whatever is configured in your **Supabase project** (not in this repo).

If signup says “check your email” but nothing arrives:

### “Email rate limit exceeded”

Supabase caps how many auth emails (signup, confirm, reset) a project can send per hour — especially on the free tier. Deleting users and re-signing up still sends new emails and can hit the limit quickly.

**Workarounds:**

1. **Wait** — often ~1 hour, then try again.  
2. **Use Google sign-in** — no confirmation email.  
3. **Turn off Confirm email** (Providers → Email) — signup won’t send mail.  
4. **Test with another address** (e.g. `you+test@gmail.com`).

### Why you often get no email

On many Supabase projects, the **built-in email** service is limited (rate limits, spam, or only reliable for team addresses). We never configured **Custom SMTP** (Resend, SendGrid, AWS SES, etc.) in the dashboard — so delivery is hit-or-miss.

### Fix for local dev (fastest)

1. **Authentication → Providers → Email** → turn **off** “Confirm email” → Save.  
2. Sign up again → you go straight to `/onboarding` (no email needed).  
3. **Or** confirm an existing user manually: **Authentication → Users** → your user → ⋮ → **Confirm user**.

### Fix for real email delivery (production)

1. **Project Settings → Authentication → SMTP Settings** (or **Authentication → Email Templates** area) → enable **Custom SMTP** and add a provider (e.g. [Resend](https://resend.com), SendGrid).  
2. Keep “Confirm email” on if you want verification.  
3. **Authentication → URL Configuration** → Redirect URLs must include:  
   `http://localhost:3000/auth/callback` (and your production URL later).

### Check whether signup actually worked

**Authentication → Users** — if the user is there with “Waiting for verification”, the account exists; you just need confirm-email off, manual confirm, or working SMTP.

### Confirmation link → “Sign-in failed” then invalid password

Usually the `/auth/callback` route failed to save the session cookie (fixed in app code). After deploying the fix:

1. **Authentication → Users** → your user → **Confirm user** (if still unverified).  
2. Sign in at `/login` with the same password you used at signup.  
3. Or disable **Confirm email** and create a fresh account.

Confirmation links must use the same Site URL as dev (`http://localhost:3000`) and include `http://localhost:3000/auth/callback` in Redirect URLs.

## 4. Restart dev server

```bash
cd caliber
npm run dev
```

On first visit to any `(app)` route while logged in, the app will:

1. Upsert all jobs from `lib/mock-data.ts` into `public.jobs`
2. If you have no applications yet, seed demo applications, resumes, and cover letters for your user

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User preferences (auto-created on signup) |
| `jobs` | Shared job catalog |
| `user_jobs` | Per-user saved / dismissed |
| `applications` | Kanban pipeline |
| `resumes` | Resume metadata (T2.3 adds storage) |
| `cover_letters` | Cover letter drafts |
| `onboarding_state` | Onboarding progress |
