import { useState, useEffect, useCallback } from 'react';

// ---- Dates (local, no external libs) ----------------------------------------
export function parseDate(iso) {
  // Treat YYYY-MM-DD as a local date (avoid UTC off-by-one).
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function daysUntil(iso) {
  const ms = parseDate(iso) - today();
  return Math.round(ms / 86400000);
}

export function fmt(iso) {
  return parseDate(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function fmtShort(iso) {
  return parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Status of an event by its date + done flag.
export function statusOf(iso, done) {
  if (done) return 'done';
  const d = daysUntil(iso);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'urgent';
  if (d <= 30) return 'soon';
  return 'upcoming';
}

// ---- LocalStorage hook ------------------------------------------------------
export function useStored(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

// Convenience: track which event ids are completed.
export function useProgress() {
  const [done, setDone] = useStored('viol_progress', {});
  const toggle = useCallback((id) => {
    setDone((d) => ({ ...d, [id]: !d[id] }));
  }, [setDone]);
  return { done, toggle };
}
