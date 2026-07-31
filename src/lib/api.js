// ============================================================================
// Thin client wrapper around the /api/state and /api/files server routes.
//
// Every call is wrapped so it NEVER throws: if the server is missing (e.g. a
// plain `vite dev` with no functions), unreachable, or not configured, the call
// resolves to a sentinel ({ ok:false, offline:true }) and the app quietly falls
// back to local-only storage. Sync is a bonus on top of localStorage — it can
// never break the app when it's unavailable.
// ============================================================================

// The login password doubles as the API token (matched against APP_API_TOKEN on
// the server). It's stashed in sessionStorage by Login.jsx on a successful sign-in.
function token() {
  try {
    return sessionStorage.getItem('viol_pw') || import.meta.env.VITE_APP_PASSWORD || '';
  } catch {
    return import.meta.env.VITE_APP_PASSWORD || '';
  }
}

function headers() {
  return { 'Content-Type': 'application/json', 'x-app-token': token() };
}

const OFFLINE = { ok: false, offline: true };

async function call(url, opts) {
  try {
    const resp = await fetch(url, opts);
    // A 404 served as HTML (no functions running) isn't JSON — guard for it.
    const ct = resp.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return OFFLINE;
    const data = await resp.json().catch(() => null);
    if (!data) return OFFLINE;
    return data;
  } catch {
    return OFFLINE;
  }
}

// ---- State ------------------------------------------------------------------

export async function fetchState() {
  return call('/api/state', { method: 'GET', headers: headers() });
}

export async function pushState(key, value) {
  return call('/api/state', { method: 'POST', headers: headers(), body: JSON.stringify({ key, value }) });
}

export async function pushStateBatch(entries) {
  return call('/api/state', { method: 'POST', headers: headers(), body: JSON.stringify({ entries }) });
}

// ---- Files ------------------------------------------------------------------

// Returns { ok, meta:{ blobId, name, type, when, size } } or an offline sentinel.
export async function uploadFile({ name, type, dataUrl, blobId }) {
  return call('/api/files', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, type, dataUrl, blobId }),
  });
}

// Returns { ok, file:{ blobId, name, type, dataUrl } } or an offline sentinel.
export async function getFile(blobId) {
  return call(`/api/files?id=${encodeURIComponent(blobId)}`, { method: 'GET', headers: headers() });
}

export async function deleteFile(blobId) {
  return call(`/api/files?id=${encodeURIComponent(blobId)}`, { method: 'DELETE', headers: headers() });
}

// ---- Media library ----------------------------------------------------------

export async function listMedia({ state, kind, q, limit } = {}) {
  const params = new URLSearchParams();
  if (state) params.set('state', state);
  if (kind) params.set('kind', kind);
  if (q) params.set('q', q);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return call(`/api/media${qs ? `?${qs}` : ''}`, { method: 'GET', headers: headers() });
}

export async function uploadMedia({ name, type, dataUrl, publish = false, kind = 'file' }) {
  return call('/api/media', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, type, dataUrl, publish, kind }),
  });
}

export async function patchMedia({ id, action, name, type, dataUrl }) {
  return call('/api/media', {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ id, action, name, type, dataUrl }),
  });
}

export async function deleteMedia(id) {
  return call(`/api/media?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(),
  });
}
