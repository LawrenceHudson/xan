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
