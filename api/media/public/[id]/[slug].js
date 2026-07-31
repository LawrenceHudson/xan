// ============================================================================
// Public media file route.
//
//   GET /api/media/public/:id/:slug
//
// Serves only published assets from Supabase Storage via first-party URL.
// ============================================================================

import {
  sbFetch,
  supaEnv,
  mediaEnv,
  notConfigured,
  MEDIA_STATES,
  sbDownloadObject,
} from '../../../_supabase.js';

function disposition(name = '', type = '') {
  const t = String(type || '').toLowerCase();
  if (t.startsWith('image/') || t === 'application/pdf') return 'inline';
  const safe = String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '-');
  return `attachment; filename="${safe || 'file'}"`;
}

export default async function handler(req, res) {
  const env = supaEnv();
  const menv = mediaEnv();
  if (!env.configured || !menv.configured) return notConfigured(res);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  }

  try {
    const id = req.query?.id;
    if (!id) return res.status(400).json({ ok: false, reason: 'missing id' });

    const rows = await sbFetch(`app_media?id=eq.${encodeURIComponent(id)}&select=*`);
    const row = (rows || [])[0];
    if (!row) return res.status(404).json({ ok: false, reason: 'not found' });

    if (row.state !== MEDIA_STATES.PUBLISHED) {
      return res.status(404).json({ ok: false, reason: 'not found' });
    }

    const out = await sbDownloadObject({
      bucket: row.bucket || menv.bucket,
      objectPath: row.storage_path,
    });

    res.setHeader('Content-Type', row.type || out.contentType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('Content-Disposition', disposition(row.name, row.type));
    return res.status(200).send(out.bytes);
  } catch (err) {
    const msg = String(err && err.message || err);
    if (/Storage download 404/i.test(msg)) return res.status(404).json({ ok: false, reason: 'not found' });
    return res.status(500).json({ ok: false, reason: msg });
  }
}
