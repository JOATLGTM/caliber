# Next session — port the remaining 11 routes

## Where we left off

Foundation is complete in `caliber/`:
- Next.js 16 + React 19 + Tailwind v4 + shadcn/ui (20 primitives installed) + lucide-react + next-themes + @dnd-kit (core + sortable).
- Fonts: Inter / Inter Tight / JetBrains Mono via `next/font` → `--font-sans`, `--font-display`, `--font-mono`.
- Design tokens in `app/globals.css`: dark-default, green-only accent (`#10b981`), full Caliber palette + shadcn bridge. Tailwind utilities like `bg-bg-elev`, `text-text-muted`, `text-text-faint`, `text-good/warn/bad`, `text-score-high/mid/low`, `border-border-strong`, `bg-accent-soft` all work.
- Mock data: `lib/mock-data.ts` — `JOBS`, `APPLICATIONS`, `RESUMES`, `COVER_LETTERS`, `USER_PROFILE`, `STATS`, `RESUME_DIFF`, `COVER_LETTER_DRAFT` + helpers `daysAgo`, `shortDate`, `scoreClass`.
- Route groups: `app/(app)/layout.tsx` (sidebar + sticky header) and `app/(marketing)/layout.tsx` (nav + footer).
- Shared components in `components/caliber/`: `MatchScoreBadge`, `JobCard`, `ApplicationCard`, `EmptyState`, `Segmented`, `ChipMulti`, `ThemeToggle`, `AppSidebar`, `AppHeader`, `MarketingNav`, `MarketingFooter`.
- Validation route done: `/dashboard`.
- `/` currently redirects to `/dashboard` — replace with the landing page in this session (move logic into `app/(marketing)/page.tsx` and delete `app/page.tsx`).

`npm run build` and `npm run lint` were clean at end of last session.

---

## Reference files (do NOT copy directly — recreate in TS/Tailwind/shadcn)

- `project/Caliber.html` — runnable prototype, open to compare visually.
- `project/styles.css` — token + spacing reference (already translated, but useful for per-component spacing details).
- `project/app-pages.jsx` — `Dashboard` (done), `JobDetail`, `Applications`, `Resumes`, `CoverLetters`, `Profile`, `Settings`, `Toggle`, `ChipMulti`.
- `project/marketing-pages.jsx` — `Landing`, `Pricing`, `PricingGrid`, `Login`, `Signup`, `Onboarding`, `FAQ`, `Segmented`, `SalarySlider`.
- `project/components.jsx` — already ported; reference for any stragglers.
- `project/design_handoff_caliber/README.md` — full design spec (read again at session start).

---

## Order to implement (one PR-sized chunk per route)

App routes first, then marketing — same order the prototype was authored in:

### 1. `/jobs/[id]` — Job detail + tailoring
**File:** `app/(app)/jobs/[id]/page.tsx` (Next 16 dynamic route — `params` is a Promise; await it).

Two-column layout (`grid-cols-2 gap-6`):

**Left column** (3 cards, `flex flex-col gap-4`):
- **Why this match** — h2 + `whyMatch` bullet list reusing the `—` prefix style. Below a divider, a 3-col mini stats grid: `Skills (n/n+2)`, `Salary fit`, `Location` (workMode).
- **Required skills + Nice to have** — chip rows. Required uses accent-tinted chips (`bg-accent-soft border-border-strong`); nice-to-have uses neutral chips. Reuse the `Chip` from dashboard but extract it to `components/caliber/chip.tsx` first.
- **About the role** — h2 + `whitespace-pre-line` description, line-height 1.65, `text-text-muted`, `text-[13.5px]`.

**Right column:**
- shadcn `Tabs` with `Resume` / `Cover letter`.
- **Resume tab:**
  - Quality score panel: `bg-bg-elev border` rounded box. Title row + big quality % display. shadcn `Progress` bar at `qualityScore%`. 2-col grid of breakdown rows (label + mono-font score, color by `state`: good→`text-good`, ok→`text-warn`, default→`text`).
  - Action row: `Regenerate` (outline) + `Download` (outline) buttons.
  - Diff list: each `RESUME_DIFF.bullets` row is a `grid-cols-2 gap-px bg-border` outer (creating a 1px divider), with two cells. Original cell is muted + line-through (only when `changed`); tailored cell has `bg-good/5` background. Below both, a full-width `diff-reason` strip with `bg-bg-elev` and `text-[11.5px] text-text-muted`. Skip strikethrough/green-tint when `changed === false` (just render both identically).
- **Cover letter tab:** Regenerate + Download row; shadcn `Textarea` with `defaultValue={COVER_LETTER_DRAFT}`, min-height ~520px.

**Top bar:**
- Breadcrumb: `Dashboard › {job.title}` (use `lucide:ChevronRight`).
- Title row: 44×44 logo, company subtitle, h1 (`text-[24px]`), meta row (location · workMode · salary · daysAgo · seniority).
- Right action cluster: `Save`, `View on company site`, primary `Mark as applied` (with `Check` icon).

Wrap container at `max-w-[1280px]` (wider than dashboard's 1200).

### 2. `/applications` — Kanban
**File:** `app/(app)/applications/page.tsx` (must be `"use client"` for DnD).

- Top bar: shadcn `Input` (search), `Filter` button (outline), `Export CSV` button (outline).
- 5 columns, `grid-cols-5 gap-3`, height `calc(100vh - 200px)` min-height 600px:
  - `Saved`, `Applied`, `Phone Screen`, `Interview`, `Offer/Closed` (combine Offer + Closed into the last column — group by `status === "Offer" || status === "Closed"`).
- Column shell: `bg-bg-elev border rounded-lg flex flex-col overflow-hidden`.
- Column header: title + count pill (`bg-background border rounded-full px-1.5 text-[11px]`) + `Plus` icon-button on the right. Padding `12px 14px`, bottom border.
- Column body: `flex-1 overflow-y-auto p-2.5 flex flex-col gap-2`. Render `ApplicationCard` (already built — it has the `cursor-grab` + outcome badge logic).
- **Wire @dnd-kit** here:
  - `DndContext` at the page level with `sensors` (PointerSensor + KeyboardSensor with `activationConstraint: { distance: 5 }`).
  - Each column is a `useDroppable({ id: status })`.
  - Each card is `useDraggable({ id: app.id, data: { status } })`.
  - On `handleDragEnd`, mutate local state (use `useState<Application[]>(APPLICATIONS)` since data is a const — copy at top).
  - Add a `DragOverlay` with the `ApplicationCard` so the drag preview is consistent.
- Won/Lost outcome badge already handled in `ApplicationCard`.

### 3. `/resumes`
**File:** `app/(app)/resumes/page.tsx`.

- Featured `Base resume` card (`isBase === true`):
  - 56×72 file-thumbnail placeholder (`bg-bg-elev-2 border rounded` with `lucide:FileText` centered).
  - Metadata: title (h2), `Updated {shortDate}`, file-size faint line ("PDF · 2 pages · 142 KB" — fake constant).
  - Actions: `Edit`, `Replace file`, `View JSON`, `Download` (all outline buttons, sm).
- Below, h2 `Tailored versions ({count})`.
- shadcn `Table` of tailored resumes (`!isBase`). Columns: `Job title` / `Company` / `Created` (`shortDate`) / `Match` (mono pill — reuse `MatchScoreBadge treatment="quiet"` or build a small `<span class="font-mono ...">` inline) / actions cell with `View` + `Download` icon-buttons.

### 4. `/cover-letters`
**File:** `app/(app)/cover-letters/page.tsx`.

- Top: h1 `Cover letters` + `New from job` primary button on the right.
- 2-column grid (`grid-cols-2 gap-3`) of cards. Each card:
  - `between` row: company (faint) + date right-aligned (`shortDate`).
  - h3 with job title (line-clamp-2).
  - Preview paragraph: `text-[13px] text-text-muted line-clamp-4 leading-[1.55]`.
  - Action row: `View`, `Edit`, `Download`, `Delete` (last one in `text-bad` for the danger affordance via outline+text-bad).
- Empty state when no letters: use `EmptyState` with `lucide:Mail`.

### 5. `/profile`
**File:** `app/(app)/profile/page.tsx` — must be client for the form state.

`max-w-[920px]` content. 3 cards stacked `flex flex-col gap-5`:

- **Personal info:** 2-col grid of fields — Name, Email, Phone, Location. Use shadcn `Input` + `Label`.
- **What you're looking for:**
  - `Target roles` — `ChipMulti` (already built).
  - `Locations` — `ChipMulti`.
  - `Work mode` — `Segmented` for Remote/Hybrid/Onsite, but multi-select. Either build a `MultiSegmented` variant or use 3 shadcn `Toggle`s side-by-side. Spec says segmented; use 3 chip-toggles for now.
  - `Minimum salary` + `Target salary` — two `Input` fields with $ prefix and tabular-nums (or shadcn `Slider` + live label — match dashboard `SalarySlider` from `marketing-pages.jsx`, lines ~290).
  - `Experience level` — `Segmented` with Entry/Mid/Senior/Staff+.
- **Skills:** `ChipMulti` with placeholder "+ Add skill".

Bottom action row (sticky-ish): `Discard` (ghost) + `Save changes` (primary). Wire to local state + `console.log` on save (no persistence per session decision).

### 6. `/settings`
**File:** `app/(app)/settings/page.tsx`.

`max-w-[920px]`. 5 cards:

- **Account:** email field (read-only), `Change password` button, `Two-factor authentication` row with shadcn `Switch`.
- **Notifications:** `Digest frequency` `Segmented` (Daily/Weekly/Off), three toggle rows (`New job matches`, `Application updates`, `Weekly summary`). Each row uses shadcn `Switch`.
- **Subscription:** current plan card — Plan name (Free/Pro), monthly cost, list of perks, `Manage billing` outline button.
- **Theme:** `Light` / `Dark` / `System` `Segmented` — wire to `next-themes`'s `setTheme`. Read current via `useTheme()`.
- **Privacy:** `Export data` outline button + `Delete account` button (red — use shadcn `Button variant="destructive"` or custom `bg-bad/10 text-bad border-bad/35`).

### 7. `/` — Landing page
**File:** `app/(marketing)/page.tsx` (then DELETE `app/page.tsx`).

Long-form. 10 sections in order, all inside the `(marketing)` layout:

1. Hero — h1 with `clamp(40px, 6vw, 64px)`, tracking `-0.035em`, max-width `18ch`. Sub copy `text-[18px] text-text-muted max-w-[56ch]`. CTAs row: `Get started` (primary) + `See how it works` (outline) link to anchors.
2. Social proof — wordmark logos row, faint, `font-display`. Use lucide brand icons or just plain text wordmarks (Stripe, Linear, Notion, Figma, Vercel, Plaid).
3. How it works — 3 numbered steps, `grid-cols-3 gap-6`.
4. Features grid — 6 cells in `grid-cols-3 gap-px bg-border` (1px-gap inset border trick) inside a `border rounded-lg overflow-hidden`. Each `feature-cell`: 28×28 icon tile + h3 + paragraph.
5. What we do / What we don't — 2-col card with check (do) / x (don't) icons. `border` + `divide-x` for the column rule.
6. Pricing preview — reuse `PricingGrid` (extract to `components/caliber/pricing-grid.tsx`).
7. FAQ — shadcn `Accordion type="single"` with 6 items.
8. Final CTA — large card, h2, "Start free, no credit card", primary button.
9. (Footer is already in the marketing layout.)

Pull copy from `marketing-pages.jsx::Landing` verbatim.

### 8. `/pricing`
**File:** `app/(marketing)/pricing/page.tsx`. Hero + `PricingGrid` (3 plans: Free / Pro / Team) + FAQ.

`PricingGrid`:
- 3 columns, `grid-cols-3 gap-3`.
- Each card: `border rounded-lg p-7`. Featured plan (Pro) has `border-text` and a `tag` ribbon top-left ("Most popular").
- Plan name (`text-[13px] text-text-muted font-medium`), big price (`font-display text-[36px] tracking-[-0.025em]` + `<small>` for `/mo`), description, feature list with check icons, CTA button at the bottom.

### 9. `/login`
**File:** `app/(marketing)/login/page.tsx`. NOTE: this will likely need its OWN layout that skips `MarketingNav`/`MarketingFooter` — either:
- Use a separate `(auth)` route group with its own layout, OR
- Render a centered card inside the marketing layout (simpler — keep nav/footer).

Spec calls for centered card with no chrome. **Recommend** moving auth routes into `app/(auth)/` group with a minimal layout:
```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return <div className="grid min-h-screen place-items-center bg-background p-8">{children}</div>;
}
```
Then move `/login`, `/signup`, `/onboarding` under `(auth)`.

Login card (`max-w-[380px] flex flex-col gap-4`):
- Centered Caliber wordmark (display, 22px).
- h1 `Welcome back` (centered, 22px).
- Sub copy.
- `Continue with Google` outline button (full-width) with Google "G" icon (use lucide alternative or inline SVG).
- `OR` divider — `flex items-center gap-3 text-text-faint text-[11px] uppercase tracking-[0.05em]` with horizontal rules on either side via `::before`/`::after` or `<div className="h-px flex-1 bg-border" />`.
- Email field, Password field (label + Input).
- `Sign in` primary button (full-width).
- Footer link: `New to Caliber? Create account` → `/signup`.
- Legal microcopy: `By signing in you agree to our Terms…`.

### 10. `/signup`
**File:** `app/(auth)/signup/page.tsx`. Same shape as login but with Name field added, h1 `Create your account`, `Sign up` button, footer link to `/login`.

### 11. `/onboarding`
**File:** `app/(auth)/onboarding/page.tsx`. 3-step flow, single client component with local `step` state.

- Stepper at top: 22px circles (`grid place-items-center rounded-full border`), connected by 1px `flex-1 bg-border` lines. Filled state (`bg-text text-bg`) for done/current. "Step N of 3" caption.
- **Step 1 — Welcome:**
  - Card with h1 + 3-bullet preview ("We'll learn what you want / We'll find well-matched jobs / We'll tailor your materials").
  - Primary `Get started` CTA.
- **Step 2 — Upload resume:**
  - Drag-and-drop dropzone: `border-dashed border-border-strong bg-bg-elev rounded-lg p-12 text-center`. lucide `Upload` icon, "Drop your resume here, or **browse**" copy. Wire a hidden `<input type="file" accept=".pdf,.docx" />` triggered by the dropzone click. Don't actually parse — just stash filename in local state and show "Uploaded: filename.pdf".
  - `Skip for now` link + `Back` / `Continue` buttons row.
- **Step 3 — Preferences form:**
  - Target roles `ChipMulti`.
  - Locations `ChipMulti`.
  - Work mode `Segmented` (multi).
  - Minimum salary slider — shadcn `Slider min={50000} max={400000} step={5000}` with live `$Xk` label above. Build a tiny `SalarySlider` component for reuse.
  - Experience level `Segmented`.
  - Final CTA: `Take me to my dashboard` (primary, full-width). On click → `router.push('/dashboard')`.

---

## Per-session checklist

After each route:
1. `npm run lint` — clean.
2. `npm run build` — clean.
3. Open `http://localhost:3000` and visually compare against `project/Caliber.html` open in another tab. Confirm tokens, spacing, type sizes, colors match.
4. Mark the route done in this file (or delete its section).

After ALL 11 routes:
- Responsive QA at ≤900px:
  - Sidebar collapses (consider shadcn `Sheet` for mobile drawer triggered from header).
  - Stats grid → 2×2.
  - Job cards single-col with score moving below content.
  - Kanban → vertical stack.
  - Feature/price/do-grids → 1 col.
- Run `npm run build` one final time.
- Delete `app/page.tsx` (the temporary redirect) once `(marketing)/page.tsx` exists.

---

## Components likely to be extracted during this session

Add to `components/caliber/`:
- `chip.tsx` — used by dashboard, job detail, profile. Extract from the inline `Chip` in `app/(app)/dashboard/page.tsx`.
- `pricing-grid.tsx` — used by `/` and `/pricing`.
- `salary-slider.tsx` — used by `/profile` and `/onboarding`.
- `faq.tsx` (optional) — wraps shadcn `Accordion` with the prototype's question/answer copy.
- `do-dont-grid.tsx` (optional) — only if the landing's "what we do / don't" reads well as a reusable.

---

## Things explicitly NOT in this session (do AFTER all 11 routes)

These were already deferred per our earlier alignment. Keep stub buttons / `console.log` handlers in the meantime.

- Auth (Google OAuth, email/password persistence).
- AI tailoring (resume rewrite, cover letter generation).
- Quality scoring algorithm.
- ⌘K command palette (shadcn `Command` is installed; wire it later).
- Toasts (install shadcn `sonner` or `toast` when wiring real actions).
- File upload parsing on `/onboarding` step 2.
- Real save/dismiss/delete persistence on jobs, resumes, cover letters, applications.

User's standing decisions:
- Keep mock data static (`lib/mock-data.ts`) — no localStorage hydration this session.
- Green-only accent — do not expose mono/blue/indigo.

---

## Known follow-ups

1. **Workspace root warning** at build time: Next detects two lockfiles. One-line fix in `next.config.ts`:
   ```ts
   const nextConfig: NextConfig = {
     turbopack: { root: __dirname },
   };
   ```
2. **Light theme**: tokens are wired and toggleable, but only dark + green has been visually scrutinized. Quick pass through each route in light mode at the end of this session.
