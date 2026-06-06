// ============================================================================
// iCalendar (.ics) builder — the single place that turns roadmap milestones
// into a standards-compliant calendar feed.
//
// Used by BOTH:
//   • the React app  (src/components/CalendarSync.jsx) → "Download .ics" button
//   • the serverless feed (api/calendar.ics.js)        → subscribe URL Google polls
//
// Output is RFC 5545 iCalendar. Milestones become ALL-DAY events (their dates
// are "YYYY-MM-DD"), each with a stable UID (so re-imports update instead of
// duplicating) and DISPLAY alarms mirroring the event's `remind: [days]` array.
// ============================================================================

import { EVENTS, CATEGORIES, STUDENT } from './roadmap.js';

const pad = (n) => String(n).padStart(2, '0');

// "2026-12-01" → "20261201" (iCalendar DATE value).
function toIcsDate(iso) {
  return iso.replace(/-/g, '');
}

// All-day DTEND is EXCLUSIVE, so it must be the day AFTER the event date.
function nextDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`;
}

// UTC timestamp for DTSTAMP: YYYYMMDDTHHMMSSZ.
function dtStamp(date = new Date()) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
    + `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

// Escape reserved characters (RFC 5545 §3.3.11).
function esc(s = '') {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Fold lines to 75 octets, never splitting a multi-byte character (emoji-safe).
// TextEncoder is global in browsers and Node 18+ (Vercel's runtime).
function fold(line) {
  const bytes = (str) => new TextEncoder().encode(str).length;
  if (bytes(line) <= 75) return line;
  const out = [];
  let cur = '';
  let curBytes = 0;
  let first = true;
  for (const ch of line) {            // iterates by code point
    const cb = bytes(ch);
    const limit = first ? 75 : 74;    // continuation lines reserve 1 for the space
    if (curBytes + cb > limit) {
      out.push(first ? cur : ' ' + cur);
      first = false;
      cur = ch;
      curBytes = cb;
    } else {
      cur += ch;
      curBytes += cb;
    }
  }
  if (cur) out.push(first ? cur : ' ' + cur);
  return out.join('\r\n');
}

function vevent(e, domain) {
  const cat = CATEGORIES[e.category] || {};
  const summary = `${cat.emoji || ''} ${e.title}`.trim();
  const lines = [
    'BEGIN:VEVENT',
    `UID:${e.id}@${domain}`,
    `DTSTAMP:${dtStamp()}`,
    `DTSTART;VALUE=DATE:${toIcsDate(e.date)}`,
    `DTEND;VALUE=DATE:${nextDay(e.date)}`,
    `SUMMARY:${esc(summary)}`,
  ];
  const desc = [e.detail, e.link ? `More info: ${e.link}` : ''].filter(Boolean).join('\n\n');
  if (desc) lines.push(`DESCRIPTION:${esc(desc)}`);
  if (e.link) lines.push(`URL:${esc(e.link)}`);
  if (cat.label) lines.push(`CATEGORIES:${esc(cat.label)}`);
  lines.push('TRANSP:TRANSPARENT');

  // One DISPLAY alarm per "days before" entry (e.g. remind:[7,1] → 7 & 1 days out).
  for (const d of (e.remind || [])) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(e.title)}`,
      `TRIGGER:-P${d}D`,
      'END:VALARM',
    );
  }
  lines.push('END:VEVENT');
  return lines;
}

// Build the full VCALENDAR string. `events` defaults to the built-in milestones;
// the client passes EVENTS + custom items + volunteer entries for the download.
export function buildCalendar(events = EVENTS, { domain = 'violet-roadmap', name } = {}) {
  const calName = name || `${STUDENT.name}'s Art-School Roadmap`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Violet Art-School Roadmap//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(calName)}`,
    `NAME:${esc(calName)}`,
    `X-WR-CALDESC:${esc(`Milestones for ${STUDENT.name}'s art-school journey (${STUDENT.enrollTerm}).`)}`,
    'X-WR-TIMEZONE:America/New_York',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
  ];
  for (const e of events) {
    if (!e || !e.date) continue;
    for (const l of vevent(e, domain)) lines.push(l);
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
