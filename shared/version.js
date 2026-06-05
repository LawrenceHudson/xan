// ============================================================================
// App version + release notes — shown on the Admin tab.
//
// HOW TO UPDATE (every time the app changes):
//   1. Bump APP_VERSION (semver: MAJOR.MINOR.PATCH).
//   2. Add a new entry to the TOP of CHANGELOG with today's date and a short
//      list of what changed.
// The Admin tab renders this automatically.
// ============================================================================

export const APP_VERSION = '1.9.0';

export const CHANGELOG = [
  {
    version: '1.9.0',
    date: '2026-06-05',
    notes: [
      'Your data now syncs across browsers and devices. Until now, everything was saved only inside the one browser you typed it in — so opening the site on a phone, a second computer, or a private window showed nothing. Now everything (tasks, writing, achievements, savings, portfolio notes, and uploaded résumés, letters, and documents) is saved to a secure online database and appears everywhere you log in.',
      'The first time you log in after this update, whatever you already have in this browser is automatically uploaded so nothing is lost — then it shows up on your other devices too.',
      'It still works offline: if the internet or the database is unavailable, the app keeps saving locally and syncs up the next time it can reach the server.',
      'Setup (one time): create a free Supabase project, run the included supabase-setup.sql, and add NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and APP_API_TOKEN to Vercel. See the README for step-by-step instructions.',
    ],
  },
  {
    version: '1.8.0',
    date: '2026-06-05',
    notes: [
      'Fixed a data-loss bug: uploaded files (résumés, letters, documents) used to share the browser’s small ~5 MB storage with everything else, so a few big files could quietly use it all up and make newly-added items (like Achievements) vanish on reload. Files now live in a separate, much larger store (IndexedDB), and existing uploads move over automatically.',
      'If a save ever fails, you now get a clear warning banner instead of silent data loss.',
      'New Backup button on the Admin tab — download a single file with everything saved in this browser, so you always have a recovery copy.',
    ],
  },
  {
    version: '1.7.0',
    date: '2026-06-04',
    notes: [
      'Removed the Checklist tab — it duplicated the Roadmap. The Roadmap now does everything the Checklist did: it shows your custom calendar items and volunteer hours alongside the milestones, has the % done progress bar, and a “Hide done” toggle.',
    ],
  },
  {
    version: '1.6.0',
    date: '2026-06-04',
    notes: [
      'Recommendations tab now has a “Letters & documents” vault — upload any Word or PDF (a general letter, brag sheet, résumé copy), keep it in the browser, and download it anytime to attach to an application. Not tied to a single recommender.',
      'Campus-visit milestones now link straight to each school’s official tour-registration page (MassArt, MECA&D, RISD, CalArts) and are reframed as “Schedule + take the tour” — they already show on the Checklist and Calendar.',
      'Redesigned the front page: visitors now see a public welcome about Xanderr and her 529 gift page by default, with a “Log in” link that pops up the password field only when clicked.',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-06-04',
    notes: [
      'New Recommendations tab — track each recommender (role, which schools, status, asked/needed-by dates, notes) AND store the finished letter itself, so a “general” letter is always ready to attach.',
      'Reminder emails now send from nick.cage@xanderr.com (the verified xanderr.com domain).',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-06-04',
    notes: [
      'New Writing tab — collect stories, poems, plays, D&D campaigns, and college essays in one place, with a live word counter, per-school essay prompts/limits, ⭐ favorites, and TXT export.',
      'Achievements can now link an image — click the thumbnail on any card to view the artwork full-size.',
      'Admin tab has a Bug / Feature submitter — log items and clear them one-by-one or all at once.',
      'Dashboard now shows a “Creative momentum” row: portfolio finals, achievements, writing pieces, volunteer hours, and savings progress.',
      'The login screen now features a 529 gifting splash with a direct link for family & friends to contribute.',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-06-04',
    notes: [
      'Added a “From Dad” tab — a personal letter to Violet about why this is a many-options plan, not a RISD-only plan.',
      'Letter text lives in shared/roadmap.js (DAD_NOTE) so it’s easy to edit anytime.',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-06-04',
    notes: [
      'New Achievements tab — track awards, shows, sales, publications & more, with TXT export.',
      'New Resume tab — writing tips plus upload/download slots for an art résumé and a young-career résumé.',
      'New Volunteer tab — log service hours; entries also appear on the Checklist.',
      'Calendar & Checklist now support custom items you add yourself (with reminder dates).',
      'New Admin tab — test-email button, version number, and these release notes.',
      'Added a proper tab/site icon (favicon).',
      'Added a light/dark mode toggle in the top bar.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-04',
    notes: [
      'Added Portfolio tracker (idea → in-progress → revise → final) tagged by school + scholarship.',
      'Added SlideRoom-style Gallery wall to review finished pieces.',
      'Added Decisions tab with per-school status and a May 1 Decision Day countdown.',
      'Added cost + average aid + average net price + Net Price Calculator links to every college.',
      'Added required campus-visit milestones and National Portfolio Day (Boston, Nov 1 2026).',
      'Fixed the tab bar so all modules are visible (wraps instead of clipping).',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-04',
    notes: [
      'First release: Dashboard, Roadmap timeline, Calendar, Checklist, Scholarships, Colleges, Savings.',
      'Automatic email reminders via Resend on a daily Vercel Cron schedule.',
      'Single source of truth in shared/roadmap.js for every date, school, and scholarship.',
    ],
  },
];
