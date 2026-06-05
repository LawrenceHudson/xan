// ============================================================================
// The client-side sync store. One in-memory cache of every `viol_` key that:
//
//   • reads/writes localStorage instantly (so the app is fast and never loses
//     data, even with no network), AND
//   • mirrors every change up to the server (/api/state) so the SAME data shows
//     up in every browser and on every device.
//
// useStored() (in util.js) is a thin React wrapper over this store, so all the
// existing screens keep working unchanged.
//
// Design notes:
//   - localStorage is the always-available fallback. The server is the shared
//     source of truth ACROSS devices. On hydrate, server values win (that's what
//     makes a second browser show the first browser's data).
//   - Writes go to localStorage synchronously, then to the server debounced
//     (per key) so rapid typing coalesces into one network write.
//   - If the server is missing/unreachable, everything still works locally; the
//     server calls just no-op.
// ============================================================================

import { reportStorageError } from './util.js';
import { fetchState, pushState, pushStateBatch } from './api.js';
import { idbEntries } from './idb.js';
import { uploadFile } from './api.js';

const PREFIX = 'viol_';
const cache = new Map();          // key -> current value (parsed)
const subs = new Map();           // key -> Set<callback>
const timers = new Map();         // key -> debounce timeout id
let hydrated = false;

// ---- localStorage helpers ---------------------------------------------------

function lsRead(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : initial;
  } catch {
    return initial;
  }
}

function lsWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Surface quota failures via the banner (same behaviour as before).
    reportStorageError(key, err);
  }
}

// ---- read / write -----------------------------------------------------------

// Current value for a key: cache first, then localStorage, then the initial.
export function storeGet(key, initial) {
  if (cache.has(key)) return cache.get(key);
  const v = lsRead(key, initial);
  cache.set(key, v);
  return v;
}

// Update a key everywhere: cache → localStorage (now) → server (debounced) →
// notify React subscribers so every mounted screen re-renders.
export function storeSet(key, value) {
  cache.set(key, value);
  lsWrite(key, value);
  notify(key, value);
  schedulePush(key, value);
}

function schedulePush(key, value) {
  const prev = timers.get(key);
  if (prev) clearTimeout(prev);
  timers.set(key, setTimeout(() => {
    timers.delete(key);
    // Fire-and-forget; api.js swallows offline/errors. The localStorage copy
    // already holds the data, so a failed push is never data loss.
    pushState(key, value);
  }, 500));
}

// ---- subscriptions ----------------------------------------------------------

export function storeSubscribe(key, cb) {
  let set = subs.get(key);
  if (!set) { set = new Set(); subs.set(key, set); }
  set.add(cb);
  return () => set.delete(cb);
}

function notify(key, value) {
  const set = subs.get(key);
  if (set) for (const cb of set) cb(value);
}

// ---- hydrate (pull the server's data on sign-in) ----------------------------

// Called once after login. Pulls every key from the server and merges it into
// the cache (server wins), notifying any mounted screens so they update live.
// If the server is empty but this browser has data, push the local data up
// (first-run migration). Safe to call more than once; only acts the first time.
export async function hydrate() {
  if (hydrated) return;
  hydrated = true;

  const res = await fetchState();
  if (!res || !res.ok) {
    // No server / not configured / unreachable → stay local-only. The app keeps
    // working from localStorage exactly as before.
    return;
  }

  const server = res.state || {};
  const serverKeys = Object.keys(server);

  if (serverKeys.length === 0) {
    // Server is empty → this is the first device to sync. Push everything we
    // have locally up so it's preserved and available everywhere.
    await migrateLocalToServer();
    return;
  }

  // Server has data → it's the shared source of truth. Apply each server value
  // to the cache + localStorage and tell React about it.
  for (const k of serverKeys) {
    const value = server[k];
    cache.set(k, value);
    lsWrite(k, value);
    notify(k, value);
  }

  // Also push up any local-only keys the server hasn't seen yet (e.g. data this
  // browser added before sync existed), so nothing is stranded.
  const localOnly = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX) && !(k in server)) {
      localOnly[k] = lsRead(k, null);
    }
  }
  if (Object.keys(localOnly).length) await pushStateBatch(localOnly);
}

// First-run push of this browser's entire state (and any locally-stored file
// blobs) up to the empty server. Runs at most once per browser.
export async function migrateLocalToServer() {
  if (localStorage.getItem('viol_synced_v1') === '1') return;

  // 1) All small data.
  const entries = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) entries[k] = lsRead(k, null);
  }
  if (Object.keys(entries).length) {
    const r = await pushStateBatch(entries);
    if (!r || !r.ok) return; // server unavailable — try again next load
  }

  // 2) Any file blobs sitting in IndexedDB → upload with their existing blobId
  //    preserved, so the metadata pointers in the data above still resolve.
  try {
    const blobs = await idbEntries(); // { blobId: dataUrl }
    for (const [blobId, dataUrl] of Object.entries(blobs)) {
      if (dataUrl) await uploadFile({ blobId, dataUrl, name: '', type: '' });
    }
  } catch {
    // IndexedDB unavailable or empty — fine, the metadata is already up.
  }

  localStorage.setItem('viol_synced_v1', '1');
}
