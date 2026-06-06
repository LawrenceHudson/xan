// ============================================================================
// Vercel serverless route → /api/calendar.ics
//
// A live iCalendar feed of every built-in roadmap milestone. This is the URL
// Violet subscribes to once in Google/Apple Calendar; the calendar app re-fetches
// it on its own schedule (Google: usually every several hours), so edits to
// shared/roadmap.js flow out automatically — no re-importing.
//
// NOTE: this endpoint is intentionally UNAUTHENTICATED. Calendar subscribers
// (Google's poller, the iOS calendar daemon) can't send a password, so the feed
// has to be open. The data is just family milestone dates, and the URL is on an
// obscure deployment domain — fine for a private family tool, but treat the link
// as effectively public and keep it within the family.
//
// Custom calendar items live in each browser (localStorage), which the server
// can't see, so the feed carries only the built-in milestones. The in-app
// "Download .ics" button bundles custom items too.
// ============================================================================

import { EVENTS } from '../shared/roadmap.js';
import { buildCalendar } from '../shared/ics.js';

export default function handler(req, res) {
  // Fixed domain in the UID keeps each event's identity stable no matter which
  // deployment URL (production vs. preview) the calendar app fetched it from —
  // so subscribers update events in place instead of duplicating them.
  const ics = buildCalendar(EVENTS, { domain: 'violet-roadmap' });

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="violet-roadmap.ics"');
  // Let CDNs/calendar clients cache for an hour; they poll on their own cadence.
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(ics);
}
