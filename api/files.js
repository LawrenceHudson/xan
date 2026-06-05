// ============================================================================
// /api/files — cross-device storage for uploaded files (résumés, letters, docs).
//
//   GET  ?id=<blobId>                         → { ok, file: { blobId, name, type, dataUrl } }
//   POST { name, type, dataUrl, blobId? }     → store/replace a file, returns its meta
//   DELETE ?id=<blobId>                        → remove a file
//
// The file bytes are kept base64-encoded in the Supabase `app_files.data` column.
// Gated by the x-app-token header.
// ============================================================================

import { authed, sbFetch, supaEnv, notConfigured } from './_supabase.js';

function newBlobId() {
  return `blob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req, res) {
  if (!supaEnv().configured) return notConfigured(res);
  if (!authed(req)) return res.status(401).json({ ok: false, reason: 'unauthorized' });

  try {
    if (req.method === 'GET') {
      const id = req.query?.id || idFromUrl(req.url);
      if (!id) return res.status(400).json({ ok: false, reason: 'missing id' });
      const rows = await sbFetch(`app_files?blob_id=eq.${encodeURIComponent(id)}&select=blob_id,name,type,data`);
      const row = (rows || [])[0];
      if (!row) return res.status(404).json({ ok: false, reason: 'not found' });
      return res.status(200).json({
        ok: true,
        file: { blobId: row.blob_id, name: row.name, type: row.type, dataUrl: row.data },
      });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body || !body.dataUrl) return res.status(400).json({ ok: false, reason: 'missing dataUrl' });
      const blobId = body.blobId || newBlobId();
      const size = body.dataUrl.length;
      await sbFetch('app_files', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: [{ blob_id: blobId, name: body.name || '', type: body.type || '', data: body.dataUrl, size }],
      });
      return res.status(200).json({
        ok: true,
        meta: {
          blobId,
          name: body.name || '',
          type: body.type || '',
          when: new Date().toISOString().slice(0, 10),
          size,
        },
      });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || idFromUrl(req.url);
      if (!id) return res.status(400).json({ ok: false, reason: 'missing id' });
      await sbFetch(`app_files?blob_id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        prefer: 'return=minimal',
      });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, reason: String(err && err.message || err) });
  }
}

function idFromUrl(url) {
  const m = /[?&]id=([^&]+)/.exec(url || '');
  return m ? decodeURIComponent(m[1]) : '';
}

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
