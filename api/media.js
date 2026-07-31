// ============================================================================
// /api/media — authenticated media management API.
//
//   GET                  -> list media metadata
//   POST                 -> upload new asset (dataUrl payload)
//   PATCH                -> publish/unpublish/rename/replace/restore
//   DELETE ?id=<mediaId> -> soft-delete an asset
//
// NOTE: this is additive-only and does not alter existing app content fields.
// ============================================================================

import {
  authed,
  sbFetch,
  supaEnv,
  mediaEnv,
  notConfigured,
  MEDIA_STATES,
  MEDIA_MAX_BYTES,
  isAllowedMediaType,
  makeMediaId,
  slugifyName,
  safeFileName,
  decodeDataUrl,
  sbUploadObject,
} from './_supabase.js';

const GRACE_DAYS = 30;

function hostOrigin(req) {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  return host ? `${proto}://${host}` : '';
}

function publicUrl(req, id, slug) {
  const origin = hostOrigin(req);
  const s = encodeURIComponent(slug || 'file');
  return origin ? `${origin}/api/media/public/${encodeURIComponent(id)}/${s}` : `/api/media/public/${id}/${s}`;
}

function objectPathFor({ id, version, filename }) {
  return `media/${id}/v${version}/${filename}`;
}

function addDaysIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function parseLimit(q) {
  const n = Number(q);
  if (!Number.isFinite(n)) return 100;
  return Math.max(1, Math.min(200, Math.floor(n)));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return await new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve(null); }
    });
    req.on('error', () => resolve(null));
  });
}

async function byId(id) {
  const rows = await sbFetch(`app_media?id=eq.${encodeURIComponent(id)}&select=*`);
  return (rows || [])[0] || null;
}

function mapRow(req, row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    size: row.size,
    state: row.state,
    kind: row.kind || 'file',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || null,
    deleteAfter: row.delete_after || null,
    publicUrl: row.state === MEDIA_STATES.PUBLISHED ? publicUrl(req, row.id, row.slug) : null,
  };
}

export default async function handler(req, res) {
  const env = supaEnv();
  const menv = mediaEnv();
  if (!env.configured || !menv.configured) return notConfigured(res);
  if (!authed(req)) return res.status(401).json({ ok: false, reason: 'unauthorized' });

  try {
    if (req.method === 'GET') {
      const state = (req.query?.state || '').trim();
      const kind = (req.query?.kind || '').trim();
      const q = (req.query?.q || '').trim();
      const limit = parseLimit(req.query?.limit);

      const parts = ['app_media?select=*', `order=created_at.desc`, `limit=${limit}`];
      if (state) parts.push(`state=eq.${encodeURIComponent(state)}`);
      if (kind) parts.push(`kind=eq.${encodeURIComponent(kind)}`);
      if (q) parts.push(`name=ilike.*${encodeURIComponent(q)}*`);

      const rows = await sbFetch(parts.join('&'));
      return res.status(200).json({ ok: true, items: (rows || []).map((r) => mapRow(req, r)) });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body || !body.dataUrl) return res.status(400).json({ ok: false, reason: 'missing dataUrl' });

      const decoded = decodeDataUrl(body.dataUrl);
      if (!decoded.ok) return res.status(400).json({ ok: false, reason: decoded.reason });
      if (decoded.bytes.length > MEDIA_MAX_BYTES) return res.status(413).json({ ok: false, reason: 'file-too-large' });

      const type = (body.type || decoded.type || '').toLowerCase();
      if (!isAllowedMediaType(type)) return res.status(415).json({ ok: false, reason: 'unsupported-media-type' });

      const id = makeMediaId();
      const slug = slugifyName(body.name || 'file');
      const filename = safeFileName(body.name || `${slug}`);
      const version = 1;
      const storagePath = objectPathFor({ id, version, filename });
      const now = new Date().toISOString();
      const state = body.publish ? MEDIA_STATES.PUBLISHED : MEDIA_STATES.DRAFT;

      await sbUploadObject({
        bucket: menv.bucket,
        objectPath: storagePath,
        bytes: decoded.bytes,
        contentType: type,
        upsert: true,
      });

      await sbFetch('app_media', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: [{
          id,
          slug,
          name: body.name || filename,
          type,
          kind: body.kind || 'file',
          size: decoded.bytes.length,
          state,
          version,
          storage_path: storagePath,
          bucket: menv.bucket,
          created_at: now,
          updated_at: now,
          published_at: state === MEDIA_STATES.PUBLISHED ? now : null,
          delete_after: null,
        }],
      });

      const row = await byId(id);
      return res.status(200).json({ ok: true, item: mapRow(req, row) });
    }

    if (req.method === 'PATCH') {
      const body = await readBody(req);
      const id = body && body.id;
      const action = body && body.action;
      if (!id || !action) return res.status(400).json({ ok: false, reason: 'missing id or action' });

      const cur = await byId(id);
      if (!cur) return res.status(404).json({ ok: false, reason: 'not-found' });

      if (action === 'publish' || action === 'unpublish' || action === 'restore') {
        const nextState = action === 'publish'
          ? MEDIA_STATES.PUBLISHED
          : action === 'unpublish'
            ? MEDIA_STATES.DRAFT
            : MEDIA_STATES.DRAFT;
        const now = new Date().toISOString();
        await sbFetch('app_media', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: [{
            ...cur,
            state: nextState,
            updated_at: now,
            published_at: action === 'publish' ? now : cur.published_at,
            delete_after: action === 'restore' ? null : cur.delete_after,
          }],
        });
        const row = await byId(id);
        return res.status(200).json({ ok: true, item: mapRow(req, row) });
      }

      if (action === 'rename') {
        const name = String(body.name || '').trim();
        if (!name) return res.status(400).json({ ok: false, reason: 'missing-name' });
        const now = new Date().toISOString();
        await sbFetch('app_media', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: [{ ...cur, name, slug: slugifyName(name), updated_at: now }],
        });
        const row = await byId(id);
        return res.status(200).json({ ok: true, item: mapRow(req, row) });
      }

      if (action === 'replace') {
        if (!body.dataUrl) return res.status(400).json({ ok: false, reason: 'missing dataUrl' });
        const decoded = decodeDataUrl(body.dataUrl);
        if (!decoded.ok) return res.status(400).json({ ok: false, reason: decoded.reason });
        if (decoded.bytes.length > MEDIA_MAX_BYTES) return res.status(413).json({ ok: false, reason: 'file-too-large' });

        const type = (body.type || decoded.type || cur.type || '').toLowerCase();
        if (!isAllowedMediaType(type)) return res.status(415).json({ ok: false, reason: 'unsupported-media-type' });

        const name = String(body.name || cur.name || 'file').trim();
        const version = Number(cur.version || 1) + 1;
        const filename = safeFileName(name);
        const storagePath = objectPathFor({ id, version, filename });

        await sbUploadObject({
          bucket: cur.bucket || menv.bucket,
          objectPath: storagePath,
          bytes: decoded.bytes,
          contentType: type,
          upsert: true,
        });

        const now = new Date().toISOString();
        await sbFetch('app_media', {
          method: 'POST',
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: [{
            ...cur,
            name,
            slug: slugifyName(name),
            type,
            size: decoded.bytes.length,
            version,
            storage_path: storagePath,
            state: cur.state === MEDIA_STATES.SOFT_DELETED ? MEDIA_STATES.DRAFT : cur.state,
            updated_at: now,
            delete_after: null,
          }],
        });

        const row = await byId(id);
        return res.status(200).json({ ok: true, item: mapRow(req, row) });
      }

      return res.status(400).json({ ok: false, reason: 'unsupported-action' });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id) return res.status(400).json({ ok: false, reason: 'missing id' });
      const cur = await byId(id);
      if (!cur) return res.status(404).json({ ok: false, reason: 'not-found' });

      const now = new Date().toISOString();
      await sbFetch('app_media', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: [{
          ...cur,
          state: MEDIA_STATES.SOFT_DELETED,
          updated_at: now,
          delete_after: addDaysIso(GRACE_DAYS),
        }],
      });
      const row = await byId(id);
      return res.status(200).json({ ok: true, item: mapRow(req, row) });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, reason: String(err && err.message || err) });
  }
}
