// ============================================================================
// Vercel Cron → Resend email reminder job.
// Runs daily (see vercel.json). Finds milestones whose `remind` days-before
// match today, and emails a digest to everyone in REMINDER_TO via Resend.
//
// Required env vars (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   - from https://resend.com (free: 3,000/mo)
//   REMINDER_FROM    - verified sender, e.g. "Violet's Roadmap <onboarding@resend.dev>"
//   REMINDER_TO      - comma-separated recipients
//   CRON_SECRET      - (optional) shared secret; Vercel Cron sends it as Bearer
//
// Local test (no email sent unless RESEND_API_KEY is set):  npm run reminders:test
// ============================================================================

import { EVENTS, CATEGORIES, STUDENT } from '../shared/roadmap.js';
import { APP_VERSION } from '../shared/version.js';

function todayLocal() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function daysUntil(iso) {
  return Math.round((parseDate(iso) - todayLocal()) / 86400000);
}
function fmt(iso) {
  return parseDate(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Which events should fire a reminder today?
export function dueToday() {
  const out = [];
  for (const e of EVENTS) {
    const d = daysUntil(e.date);
    const remind = e.remind || [7];
    if (remind.includes(d)) out.push({ ...e, days: d });
  }
  // Soonest first.
  return out.sort((a, b) => a.days - b.days);
}

function buildHtml(items) {
  const rows = items.map((e) => {
    const c = CATEGORIES[e.category] || { label: '', emoji: '•', color: '#7c3aed' };
    const when = e.days === 0 ? 'TODAY' : e.days === 1 ? 'TOMORROW' : `in ${e.days} days`;
    const link = e.link
      ? `<a href="${e.link}" style="color:#7c3aed;font-weight:600">Open link →</a>`
      : '';
    return `
      <tr>
        <td style="padding:14px;border-bottom:1px solid #ece8f5;vertical-align:top">
          <span style="display:inline-block;background:${c.color};color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px">${c.emoji} ${c.label}</span>
          <div style="font-size:16px;font-weight:700;margin:6px 0 2px">${e.title}</div>
          <div style="color:#6b7280;font-size:13px">${fmt(e.date)} · <strong style="color:#ef4444">${when}</strong></div>
          ${e.detail ? `<div style="color:#374151;font-size:13px;margin-top:6px">${e.detail}</div>` : ''}
          ${link ? `<div style="margin-top:6px">${link}</div>` : ''}
        </td>
      </tr>`;
  }).join('');

  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:24px;border-radius:16px 16px 0 0">
      <div style="font-size:22px;font-weight:800">🎨 ${STUDENT.name}'s Roadmap — Reminder</div>
      <div style="opacity:.9;margin-top:4px">Your future, in your hands. Here's what's coming up.</div>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ece8f5;border-top:none;border-radius:0 0 16px 16px">
      ${rows}
    </table>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
      Open the roadmap to check these off. You've got this. ✨
    </p>
  </div>`;
}

async function postResend({ subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM || "Violet's Roadmap <onboarding@resend.dev>";
  const to = (process.env.REMINDER_TO || '').split(',').map((s) => s.trim()).filter(Boolean);

  if (!key) return { sent: false, reason: 'RESEND_API_KEY not set' };
  if (to.length === 0) return { sent: false, reason: 'REMINDER_TO is empty' };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return { sent: false, reason: `Resend ${resp.status}: ${text}` };
  }
  return { sent: true, to };
}

async function sendEmail(items) {
  const subject = items.length === 1
    ? `🎨 Reminder: ${items[0].title}`
    : `🎨 ${items.length} roadmap reminders coming up`;
  const r = await postResend({ subject, html: buildHtml(items) });
  return r.sent ? { ...r, count: items.length } : r;
}

// Ad-hoc test email (Admin tab → "Send test email").
function buildTestHtml() {
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:24px;border-radius:16px">
      <div style="font-size:22px;font-weight:800">🎨 ${STUDENT.name}'s Roadmap — Test Email</div>
      <div style="opacity:.9;margin-top:6px">If you're reading this, email reminders are working. ✅</div>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;margin-top:16px">
      Sent from the Admin tab · app v${APP_VERSION} · ${new Date().toLocaleString('en-US')}
    </p>
  </div>`;
}

async function sendTestEmail() {
  return postResend({ subject: `🎨 Test email — ${STUDENT.name}'s Roadmap is working`, html: buildTestHtml() });
}

// Vercel serverless handler.
export default async function handler(req, res) {
  // Test mode (Admin tab): send a canned email right now, no secret required.
  // This is intentionally open so the in-app button can call it; it only ever
  // emails the fixed REMINDER_TO list, so it can't be used to spam others.
  const isTest = req.query?.test === '1' || /[?&]test=1\b/.test(req.url || '');
  if (isTest) {
    const result = await sendTestEmail();
    return res.status(result.sent ? 200 : 400).json({ ok: result.sent, mode: 'test', ...result });
  }

  // Optional auth: only allow Vercel Cron (or anyone with the secret).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers?.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
  }

  const items = dueToday();
  if (items.length === 0) {
    return res.status(200).json({ ok: true, sent: false, message: 'Nothing due today.' });
  }
  const result = await sendEmail(items);
  return res.status(200).json({ ok: true, ...result, items: items.map((i) => i.title) });
}

// Allow `npm run reminders:test` from the CLI.
if (import.meta.url === `file://${process.argv[1]}`) {
  const items = dueToday();
  console.log(`\nMilestones that would email today: ${items.length}`);
  for (const i of items) console.log(`  • [${i.days}d] ${i.title} (${i.date})`);
  if (items.length) {
    sendEmail(items).then((r) => console.log('\nSend result:', r));
  } else {
    console.log('  (none — try editing a date in shared/roadmap.js to test)');
  }
}
