// ============================================================================
// Vercel Cron cleanup for expired soft-deleted media objects.
//
//   GET /api/media-cleanup
//
// Requires CRON_SECRET when configured.
// ============================================================================

import { sbFetch, supaEnv, mediaEnv, notConfigured, MEDIA_STATES, sbDeleteObject } from './_supabase.js';

export default async function handler(req, res) {
  const env = supaEnv();
  const menv = mediaEnv();
  if (!env.configured || !menv.configured) return notConfigured(res);

  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers?.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ ok: false, reason: 'unauthorized' });
    }
  }

  try {
    const now = encodeURIComponent(new Date().toISOString());
    const rows = await sbFetch(`app_media?select=*&state=eq.${MEDIA_STATES.SOFT_DELETED}&delete_after=lte.${now}&limit=200`);

    let removed = 0;
    const failed = [];

    for (const row of (rows || [])) {
      try {
        await sbDeleteObject({
          bucket: row.bucket || menv.bucket,
          objectPath: row.storage_path,
        });
      } catch (err) {
        const msg = String(err && err.message || err);
        // If storage object is already gone, still delete the metadata row.
        if (!/Storage delete 404/i.test(msg)) {
          failed.push({ id: row.id, reason: msg });
          continue;
        }
      }

      await sbFetch(`app_media?id=eq.${encodeURIComponent(row.id)}`, {
        method: 'DELETE',
        prefer: 'return=minimal',
      });
      removed += 1;
    }

    return res.status(200).json({
      ok: true,
      scanned: (rows || []).length,
      removed,
      failed,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, reason: String(err && err.message || err) });
  }
}
