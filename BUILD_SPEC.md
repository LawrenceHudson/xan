# Build Spec — "Student Journey Roadmap" template

This document generalizes the Xanderr Art Roadmap app (this repo) into a
reusable spec for building the **same app for a different kid with a
different interest** (STEM, History, Politics, Law, Medicine, Music, Athletics,
etc.). It separates what is **generic scaffolding** (copy as-is) from what is
**interest-specific content** (rename/reskin per kid).

Reference implementation: this repo. File paths below point at the real files
so a builder can diff a new instance against them.

---

## 1) What this app actually is

A private, password-gated **college/scholarship/career-prep tracker** for one
student, plus a **public showcase page** of their work, with:

- A single **data file** as source of truth (`shared/roadmap.js`)
- A **React + Vite** SPA, no framework backend — deployed free on **Vercel**
- **Automatic email reminders** before deadlines (Resend + Vercel Cron)
- Optional **cross-device sync** (Supabase) — works fully local without it
- A **public feed** (`/api/public`) that exposes only what the student
  explicitly publishes, for a marketing-style landing page

Everything else (portfolio vs. research log, gallery vs. project showcase,
"writing" vs. "essays/papers") is a themed skin over identical mechanics:
a list of items with a status, a date, a publish flag, and optional notes.

---

## 2) Tech stack (unchanged for every instance)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 + Vite 5 | `package.json`, `vite.config.js` |
| Hosting | Vercel (free/Hobby) | `vercel.json` — daily cron only on Hobby |
| Email | Resend (free tier, 3k/mo) | `api/send-reminders.js` |
| DB (optional) | Supabase (Postgres, free tier) | `supabase-setup.sql`, `api/_supabase.js` |
| Local persistence fallback | IndexedDB + localStorage | `src/lib/idb.js`, `src/lib/store.js` |
| Calendar | `.ics` snapshot + live feed | `shared/ics.js`, `api/calendar.ics.js` |
| Auth | Single shared password (`VITE_APP_PASSWORD`), session-scoped | `src/components/Login.jsx` — **not real security**, just a family gate |

No new libraries needed per kid. Do not add a UI framework, router, or state
library — the pattern deliberately stays framework-light.

---

## 3) The one file every instance edits: `shared/roadmap.js`

This is the entire configuration surface. It's imported by **both** the React
app and the serverless email job, so editing it updates the UI and the
reminder logic simultaneously. A new instance is built almost entirely by
rewriting this file's contents — component code stays generic.

Top-level exports and what they mean generically:

| Export | Generic meaning | STEM example | Law example |
|---|---|---|---|
| `STUDENT` | `{ name, nickname, enrollTerm }` | same shape | same shape |
| `CATEGORIES` | timeline tag → color/emoji/label | `research`, `competition`, `lab` | `debate`, `internship`, `case-study` |
| `COLLEGES` | target schools/programs w/ cost, deadlines, fit notes | schools w/ strong CS/engineering programs | schools w/ strong pre-law/PoliSci programs |
| `SCHOLARSHIPS` | scholarship name, deadline, link, status | STEM-specific scholarships (SMART, Regeneron, etc.) | law-specific (LSAC diversity, ABA, etc.) |
| `EVENTS` | fixed milestones on the roadmap | science fair deadlines, AP exam dates | Model UN conferences, mock trial dates |
| `FAMILY_RULES` | affordability guardrails (loan caps, etc.) | same shape | same shape |
| `QUOTES` | rotating motivational quotes | swap to field-relevant quotes | swap to field-relevant quotes |
| `PORTFOLIO` | guidance text for the "body of work" tracker | reframe as "Research/Projects" guide | reframe as "Case work/Writing" guide |
| `ACHIEVEMENT_CATEGORIES` / `ACHIEVEMENT_SEEDS` | awards/exhibitions/publications taxonomy | competitions, publications, olympiad results | mock trial awards, published op-eds, internships |
| `RESUME_GUIDE` | résumé-writing tips, tailored by field | STEM résumé tips | pre-law résumé tips |
| `VOLUNTEER_GUIDE` | service-hour tracking guidance | same shape (volunteering is field-agnostic) | same shape |
| `DAD_NOTE` | personal letter shown on a private tab | rewrite copy | rewrite copy |
| `WRITING_CATEGORIES` / `WRITING_GUIDE` | genre tags for written work | lab reports, research papers, blog posts | briefs, op-eds, policy memos |
| `RECOMMENDATIONS_GUIDE` | rec-letter tracking guidance | same shape | same shape |
| `GIFTING` | 529/support-link copy shown on the public page | same shape | same shape |

**Rule of thumb:** if a field is a date, a link, a dollar amount, a status
enum, or free text, it's generic — just retype the content. Only the
*labels/emoji* in `CATEGORIES`, `ACHIEVEMENT_CATEGORIES`, and
`WRITING_CATEGORIES` need field-specific renaming.

---

## 4) Component inventory: generic vs. needs-reskin

### Fully generic — copy unchanged, zero edits

| Component | Purpose |
|---|---|
| `Dashboard.jsx` | % complete, overdue, next-30-days, best-fit school |
| `Timeline.jsx` | chronological roadmap + progress bar |
| `CalendarView.jsx` / `CalendarSync.jsx` | month grid + `.ics` export/subscribe |
| `Checklist.jsx` | derived from roadmap/events, nothing to edit |
| `Scholarships.jsx` | status tracker (Applied/Awarded/Denied/Missed) |
| `Colleges.jsx` | funding-plan math, Net Price Calculator links |
| `Decisions.jsx` | per-school decision tracker + Decision Day countdown |
| `Savings.jsx` | deposits, 529/brokerage balances |
| `Volunteer.jsx` | service-hour log |
| `Resume.jsx` | upload/download slots + tips (tips come from `RESUME_GUIDE`) |
| `Recommendations.jsx` | recommender tracker + document vault |
| `Admin.jsx` | version, release notes, test-email button, bug tracker |
| `Note.jsx` | renders `DAD_NOTE` — generic renderer, content is the variable |
| `Login.jsx`, `StorageBanner.jsx`, `Motivation.jsx` | infra/UI chrome |
| `Climb.jsx` | generic "gamified progress" visualization — reread its exact metric before reuse, but no field-specific logic |

### Needs relabeling only (component logic stays; rename strings/tab labels)

| Component | Art framing | Generalize to |
|---|---|---|
| `PortfolioTracker.jsx` | idea → in-progress → revise → final, tagged by school/scholarship | "Project/Research Tracker" — same status pipeline works for a science-fair project, a moot-court case, a research paper |
| `Gallery.jsx` | SlideRoom-style wall of finished pieces | "Showcase" — photos of a robot, a lab poster, a courtroom exhibit, whatever has a visual artifact |
| `Writing.jsx` | stories/poems/essays with word counts | Same mechanics fit lab reports, policy memos, blog posts, personal statements |
| `Achievements.jsx` | awards/exhibitions/sales/publications | Relabel categories only (see `ACHIEVEMENT_CATEGORIES`) |
| `PublicGallery.jsx` | public "Art Gallery" landing page: Gallery + Trophy Box + Ink & Page | Public landing page: Showcase + Achievements + Writing — same three-section layout, generalize section headers and `theme-*` art-flavored copy |

**None of these require new component files or new data shapes** — a STEM kid
doesn't need a "Research Tracker" component built from scratch; `PortfolioTracker.jsx`
already models exactly that lifecycle (idea → in-progress → revise → final).
Resist the urge to add new tabs for every new interest; map new interests onto
this existing five-tab shape first, and only add a new tab if something
genuinely doesn't fit (e.g., a "Lab Hours" tab distinct from `Volunteer.jsx`
if the field needs to track lab time separately from community service).

---

## 5) Public page pattern (`PublicGallery.jsx`)

Keep the mechanism, rename the sections:

- **Publish is opt-in per item** (achievement, writing piece, portfolio/project
  piece) — off by default. This must carry over unchanged; it's the privacy
  model, not a cosmetic choice.
- Writing shows an **excerpt** unless "Show full text" is flipped — same for
  any long-form writeup (research abstract, brief summary, etc.).
- Public data is served by a **separate read-only API** (`api/public.js`) that
  can only see published items + bio. Never widen what that endpoint returns.
- SEO/AI-discoverability: schema.org structured data + meta tags +
  `public/robots.txt` — keep for any instance; it's what makes each kid's page
  show up correctly when shared or crawled.
- Theming: the public page has light/dark plus a "chaos" visual theme
  (`.theme-chaos` in `src/styles.css`) — **when adding a new theme variant,
  every element with a hardcoded light-mode color must get a matching
  `.theme-chaos …` (or new theme class) override**, or text goes invisible on
  the dark background (see the recent `.g-reader-body` bug — a hardcoded
  `color: #1f2430` fixed at "dark navy" ignored the active theme's ink color).
  Prefer `color: inherit` / CSS variables over new hardcoded hex colors.

---

## 6) Backend/API surface (unchanged per instance)

| Route | Purpose |
|---|---|
| `api/public.js` | Public read-only feed: published achievements/writing/portfolio + bio |
| `api/calendar.ics.js` | Live `.ics` feed: milestones + custom events + goal dates |
| `api/send-reminders.js` | Cron job — emails 7-day/1-day (configurable) reminders |
| `api/state.js` | Authenticated sync of full app state (Supabase-backed) |
| `api/media.js`, `api/media/public/[id]/[slug].js`, `api/media-cleanup.js` | Self-hosted media upload/serve/cleanup |
| `api/files.js` | Résumé/letter file upload-download |
| `api/_supabase.js` | Shared Supabase client helper |

None of this changes per kid. Only the **content behind it** (from
`shared/roadmap.js` and whatever the student enters in the app) changes.

---

## 7) Environment variables (per instance)

| Var | Purpose |
|---|---|
| `VITE_APP_PASSWORD` | Family login password gate |
| `RESEND_API_KEY` | Resend API key (can share one Resend account across kids if domain allows multiple `from` addresses) |
| `REMINDER_FROM` | e.g. `Name's Roadmap <name@yourdomain.com>` |
| `REMINDER_TO` | Comma-separated recipient emails |
| `CRON_SECRET` | Optional, protects the cron endpoint |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_API_TOKEN`, `SUPABASE_MEDIA_BUCKET` | Only if enabling cross-device sync — **each kid needs their own Supabase project** (or at minimum separate tables/prefixes) so data doesn't mix |

**Important:** each kid's instance needs its own Vercel project + its own
Supabase project (if used) + its own domain/subdomain. Do not point two kids'
frontends at the same Supabase project — there's no per-student partitioning
in the schema (`supabase-setup.sql` assumes one student per database).

---

## 8) Step-by-step: spinning up a new kid's instance

1. **Copy the repo** to a new folder/GitHub repo (per `README.md` §6, "Reuse
   for the other daughters later").
2. Rewrite `shared/roadmap.js` top-to-bottom for the new kid's interest:
   `STUDENT`, `CATEGORIES` labels/emoji, `COLLEGES`, `SCHOLARSHIPS`, `EVENTS`,
   `PORTFOLIO`/`ACHIEVEMENT_CATEGORIES`/`WRITING_CATEGORIES` guidance text,
   `DAD_NOTE`, `GIFTING`.
3. Update `package.json` `name`/`description`, and `src/App.jsx`'s brand emoji
   (🎨 → 🔬/⚖️/🏛️/🩺/etc.), header text (`STUDENT.name`), and any tab
   `label`/`emoji` in the `TABS` array that reads art-specific (e.g. rename
   "Portfolio" → "Projects", "Gallery" → "Showcase" tab labels only — leave
   `id`s and component wiring as-is, or rename both consistently).
4. Update `src/components/PublicGallery.jsx` section headers/copy (Gallery →
   Showcase, Ink & Page → Writing, Trophy Box → Achievements, or field-fitting
   equivalents) and the CSS class prefixes only if you want distinct branding
   — functionally the class names (`g-*`) can stay.
5. Swap the visual theme in `src/styles.css` if desired (new accent color
   variables, new `.theme-*` block) — reuse the `--gp-*` CSS variable pattern
   rather than hardcoding new colors, and double check every themed variant
   for contrast (see the `.g-reader-body` bug note in §5).
6. New Vercel project → new env vars (§7) → new Supabase project if syncing.
7. New Resend "from" address/domain verification if sending under a different
   domain; otherwise reuse the account with a different `REMINDER_FROM`.
8. Test locally (`npm run dev`, `npm run reminders:test`) before deploying,
   exactly as in `README.md` §1–2.
9. Confirm all `verify: true` dates in the new data before relying on
   reminders (README.md's "Dates to confirm" pattern applies to any field —
   whatever deadlines you seed initially should be flagged for confirmation).

---

## 9) What NOT to do

- Don't build a generic "multi-tenant" version (multiple students in one
  database/app) unless explicitly asked — the one-student-per-deployment
  model is intentional and keeps the public feed's privacy story simple.
- Don't add a CMS or admin framework for editing `shared/roadmap.js` — hand-
  editing the file is the intended workflow (README.md: "One source of
  truth").
- Don't invent new component files for interest-specific trackers before
  checking whether `PortfolioTracker`/`Gallery`/`Writing`/`Achievements`
  already model the needed lifecycle (see §4) — they almost always do.
