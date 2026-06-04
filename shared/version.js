// ============================================================================
// App version + release notes — shown on the Admin tab.
//
// HOW TO UPDATE (every time the app changes):
//   1. Bump APP_VERSION (semver: MAJOR.MINOR.PATCH).
//   2. Add a new entry to the TOP of CHANGELOG with today's date and a short
//      list of what changed.
// The Admin tab renders this automatically.
// ============================================================================

export const APP_VERSION = '1.2.0';

export const CHANGELOG = [
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
