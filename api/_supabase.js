// ============================================================================
// Shared helper for the Supabase-backed API routes (state.js, files.js).
//
// Talks to Supabase's PostgREST endpoint with plain fetch — no npm package, so
// nothing to install. The service-role key is read from the server environment
// ONLY; it never reaches the browser.
//
// Required Vercel env vars (Project → Settings → Environment Variables):
//   NEXT_PUBLIC_SUPABASE_URL   (or SUPABASE_URL)   - your project URL
//   SUPABASE_SERVICE_ROLE_KEY                       - the secret service-role key
//   APP_API_TOKEN              (recommended)        - shared password gate;
//       set it equal to the app's login password (VITE_APP_PASSWORD).
// ============================================================================

export function supaEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url: url.replace(/\/+$/, ''), key, configured: !!(url && key) };
}

// Gate every request with the app token, when one is configured. If APP_API_TOKEN
// is not set on the server we allow the request through (degraded/open mode) so a
// half-configured deploy still works — but setting it is recommended.
export function authed(req) {
  const need = process.env.APP_API_TOKEN;
  if (!need) return true;
  const got = req.headers['x-app-token'] || req.headers['X-App-Token'] || '';
  return got === need;
}

// Low-level call to the Supabase REST API. Returns the parsed JSON (or null for
// empty 204 responses). Throws on a non-2xx status with the body text attached.
export async function sbFetch(path, { method = 'GET', body, prefer } = {}) {
  const { url, key } = supaEnv();
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;

  const resp = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Supabase ${resp.status}: ${text}`);
    err.status = resp.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

// Small helper so each route returns the same "not configured" shape (HTTP 200
// with ok:false) instead of a 500 — lets the client fall back to local-only
// without throwing or showing a broken screen.
export function notConfigured(res) {
  return res.status(200).json({ ok: false, reason: 'supabase-not-configured' });
}

// ---- Reading the synced app state from the server side ----------------------
// The browser mirrors every `viol_` key into the Supabase `app_state` table
// (see src/lib/store.js). These helpers let the server-only routes (the live
// calendar feed and the daily reminder email) read what Violet typed into the
// app, so her custom events and portfolio deadlines flow into both.

import { customEvents, volunteerEvents, portfolioEvents, recommendationEvents } from '../shared/userEvents.js';

// Fetch specific keys (or all `viol_` keys if none given) → { key: value }.
// Returns {} when Supabase isn't configured, so callers degrade gracefully to
// "built-in milestones only" exactly as before sync existed.
export async function readStateKeys(keys) {
  if (!supaEnv().configured) return {};
  const path = keys && keys.length
    ? `app_state?select=key,value&key=in.(${keys.join(',')})`
    : 'app_state?select=key,value';
  const rows = await sbFetch(path);
  const out = {};
  for (const r of rows || []) out[r.key] = r.value;
  return out;
}

// The user-entered dated items, in EVENT shape:
//   • custom calendar events     (viol_custom)
//   • portfolio piece deadlines  (viol_portfolio, target date, not yet final)
//   • volunteer dates            (viol_volunteer) — only when includeVolunteer
// Never throws; on any Supabase error it resolves to [] so the feed/email still
// send the built-in milestones.
export async function loadUserEvents({ includeVolunteer = false } = {}) {
  try {
    const keys = ['viol_custom', 'viol_portfolio', 'viol_recs'];
    if (includeVolunteer) keys.push('viol_volunteer');
    const state = await readStateKeys(keys);
    const out = [
      ...customEvents(state.viol_custom || []),
      ...portfolioEvents(state.viol_portfolio || []),
      ...recommendationEvents(state.viol_recs || []),
    ];
    if (includeVolunteer) out.push(...volunteerEvents(state.viol_volunteer || []));
    return out;
  } catch {
    return [];
  }
}
