// ============================================================================
// IndexedDB blob store for uploaded files (résumés, letters, documents).
//
// WHY THIS EXISTS:
//   localStorage gives the whole site ONE ~5 MB bucket shared across every key.
//   Base64-encoded PDFs/Word docs are large (~1.3 MB each), so storing them in
//   localStorage could fill that bucket and silently block unrelated saves
//   (e.g. a new Achievement would vanish on reload). IndexedDB has a far larger
//   quota and is built for blobs — so file *contents* live here, while small
//   metadata (name, type, date, blobId) stays in localStorage.
// ============================================================================

import { triggerDownload } from './util.js';

const DB_NAME = 'viol-files';
const STORE = 'blobs';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function newBlobId() {
  return `blob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function idbPut(id, dataUrl) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(dataUrl, id);
    tx.oncomplete = () => { db.close(); resolve(id); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('Write aborted')); };
  });
}

export async function idbGet(id) {
  if (!id) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function idbDel(id) {
  if (!id) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function idbEntries() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const keysReq = store.getAllKeys();
    const valsReq = store.getAll();
    tx.oncomplete = () => {
      db.close();
      const keys = keysReq.result || [];
      const vals = valsReq.result || [];
      const out = {};
      keys.forEach((k, i) => { out[k] = vals[i]; });
      resolve(out);
    };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// Store a base64 dataUrl in IndexedDB and return the lightweight metadata
// record to keep in localStorage (no dataUrl — just a pointer + details).
export async function storeFile({ name, type, dataUrl, when }) {
  const blobId = newBlobId();
  await idbPut(blobId, dataUrl);
  return {
    name,
    type,
    when: when || new Date().toISOString().slice(0, 10),
    size: dataUrl ? dataUrl.length : 0,
    blobId,
  };
}

// Download a stored file by its blobId. Falls back to a legacy inline dataUrl
// if one is still present (e.g. mid-migration), so downloads never break.
export async function downloadStoredFile(blobId, filename, fallbackDataUrl) {
  try {
    const durl = (await idbGet(blobId)) || fallbackDataUrl;
    if (durl) { triggerDownload(filename, durl); return true; }
  } catch {
    if (fallbackDataUrl) { triggerDownload(filename, fallbackDataUrl); return true; }
  }
  alert('Sorry — that file could not be found in storage. It may need to be re-uploaded.');
  return false;
}

// Migrate a legacy record that carries an inline base64 dataUrl into IndexedDB.
// Returns a cleaned record (dataUrl stripped, blobId added). No-op if there is
// nothing to migrate. Used once on mount by each screen that stores files.
export async function ensureStored(rec) {
  if (!rec || !rec.dataUrl) return rec;
  if (rec.blobId) {
    const { dataUrl, ...rest } = rec; // already migrated; drop the stray copy
    return rest;
  }
  const blobId = newBlobId();
  await idbPut(blobId, rec.dataUrl);
  const { dataUrl, ...meta } = rec;
  return { ...meta, blobId, size: dataUrl.length };
}

// Bundle everything saved in this browser (small data + file blobs) into one
// JSON file the user can keep as a recovery copy.
export async function exportBackup() {
  const data = {
    app: 'viol-art-roadmap',
    exportedAt: new Date().toISOString(),
    schema: 1,
    localStorage: {},
    files: {},
  };
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('viol_')) data.localStorage[k] = localStorage.getItem(k);
  }
  try {
    data.files = await idbEntries();
  } catch {
    data.files = {};
  }
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(`xanderr-roadmap-backup-${new Date().toISOString().slice(0, 10)}.json`, url);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
