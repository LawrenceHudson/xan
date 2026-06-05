// ============================================================================
// /api/state — the cross-device store for all the small (non-file) data.
//
//   GET                      → { ok, state: { key: value, ... } }   (everything)
//   POST { key, value }      → upsert one key
//   POST { entries: {k:v} }  → upsert many keys at once (used by migration)
//
// Backed by the Supabase `app_state` table. Gated by the x-app-token header.
// ============================================================================

import { authed, sbFetch, supaEnv, notConfigured } from './_supabase.js';

export default async function handler(req, res) {
  if (!supaEnv().configured) return notConfigured(res);
  if (!authed(req)) return res.status(401).json({ ok: false, reason: 'unauthorized' });

  try {
    if (req.method === 'GET') {
      const rows = await sbFetch('app_state?select=key,value');
      const state = {};
      for (const r of rows || []) state[r.key] = r.value;
      return res.status(200).json({ ok: true, state });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);

      // Batch upsert: { entries: { key: value, ... } }
      if (body && body.entries && typeof body.entries === 'object') {
        const now = new Date().toISOString();
        const payload = Object.entries(body.entries).map(([key, value]) => ({
          key, value, updated_at: now,
        }));
        if (payload.length) {
          await sbFetch('app_state', {
            method: 'POST',
            prefer: 'resolution=merge-duplicates,return=minimal',
            body: payload,
          });
        }
        return res.status(200).json({ ok: true, count: payload.length });
      }

      // Single upsert: { key, value }
      if (body && typeof body.key === 'string') {
        await sbFetch('app_state', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: [{ key: body.key, value: body.value, updated_at: new Date().toISOString() }],
        });
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ ok: false, reason: 'missing key or entries' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, reason: String(err && err.message || err) });
  }
}

// Vercel usually parses JSON bodies for us, but guard for the raw-stream case.
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return await new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}
