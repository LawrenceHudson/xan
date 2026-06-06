import { useState } from 'react';
import { EVENTS } from '../../shared/roadmap.js';
import { buildCalendar } from '../../shared/ics.js';
import { useCustomItems, useVolunteer, volunteerToEvent, usePortfolioEvents, useRecommendationEvents } from '../lib/util.js';

// ============================================================================
// "Add these dates to your calendar" — two ways to get the roadmap milestones
// into Google / Apple / Outlook:
//   1) Download .ics  → a one-time snapshot (includes her custom items too).
//   2) Subscribe to the live feed (/api/calendar.ics) → auto-updates one-way
//      whenever the roadmap changes. Google refreshes it slowly (read-only).
// ============================================================================

const FEED_PATH = '/api/calendar.ics';

export default function CalendarSync() {
  const { items: custom } = useCustomItems();
  const { items: volunteer } = useVolunteer();
  const { items: portfolioEv } = usePortfolioEvents();
  const { items: recEv } = useRecommendationEvents();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const feedUrl = origin + FEED_PATH;
  const webcalUrl = feedUrl.replace(/^https?:/, 'webcal:');
  const googleAddUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;

  function download() {
    const all = [
      ...EVENTS,
      ...custom,
      ...volunteer.map(volunteerToEvent).filter((v) => v.date),
      ...portfolioEv,
      ...recEv,
    ];
    const ics = buildCalendar(all, { domain: 'violet-roadmap' });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'violet-roadmap.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="card sync-card">
      <div className="sync-head">
        <span className="sync-emoji" aria-hidden>📲</span>
        <div className="sync-title">
          <strong>Add these dates to your calendar</strong>
          <div className="small muted">Google, Apple, or Outlook.</div>
        </div>
        <button className="btn small ghost sync-toggle" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide steps' : 'How?'}
        </button>
      </div>

      <div className="editor-actions sync-actions">
        <button className="btn primary" onClick={download}>⬇ Download .ics</button>
        <a className="btn" href={googleAddUrl} target="_blank" rel="noreferrer">＋ Add to Google Calendar</a>
        <button className="btn ghost small" onClick={copy}>{copied ? 'Copied ✓' : 'Copy feed link'}</button>
      </div>

      {open && (
        <div className="sync-help small">
          <p><strong>Two ways to do this:</strong></p>
          <p>
            <strong>1) One-time import (simplest).</strong> Tap <em>Download .ics</em>, then open the
            file — your phone or computer offers to add the dates to your calendar. This version
            includes your custom calendar items, portfolio goal dates, and recommendation-letter
            dates too. It’s a snapshot, so if the roadmap changes later, just download again.
          </p>
          <p>
            <strong>2) Subscribe so it stays current (set up once).</strong> Use the feed link below
            and the calendar updates itself whenever the roadmap changes — no re-downloading.
          </p>
          <ul>
            <li>
              <strong>Google Calendar (on a computer):</strong> left sidebar → <em>Other calendars</em> →
              the <em>＋</em> → <em>From URL</em> → paste the feed link → <em>Add calendar</em>. Or just
              tap <em>＋ Add to Google Calendar</em> above.
            </li>
            <li>
              <strong>iPhone/iPad:</strong> Settings → Calendar → Accounts → Add Account → Other →
              <em>Add Subscribed Calendar</em> → paste the feed link.
            </li>
          </ul>
          <code className="sync-url">{feedUrl}</code>
          <p className="muted" style={{ marginTop: 8 }}>
            Heads-up: a subscribed calendar is <strong>read-only</strong> on your side, and Google
            refreshes it slowly (usually every few hours, sometimes up to a day). The live feed now
            carries everything — the built-in milestones plus your own custom events, portfolio goal
            dates, and recommendation-letter dates. Anyone with the feed link can see the dates, so
            keep it within the family.
          </p>
        </div>
      )}
    </div>
  );
}
