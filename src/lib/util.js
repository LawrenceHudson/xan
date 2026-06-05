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

// ---- Custom items (user-added milestones shown on Calendar + Checklist) -----
// Shape matches EVENTS so the existing screens render them with no changes:
//   { id, date, category, title, detail, link, remind, custom:true }
export function useCustomItems() {
  const [items, setItems] = useStored('viol_custom', []);
  const add = useCallback((it) => {
    setItems((list) => [
      { id: `custom-${Date.now()}`, category: 'custom', remind: [7, 1], custom: true, ...it },
      ...list,
    ]);
  }, [setItems]);
  const remove = useCallback((id) => {
    setItems((list) => list.filter((x) => x.id !== id));
  }, [setItems]);
  return { items, add, remove };
}

// ---- Volunteer records ------------------------------------------------------
//   { id, org, role, date, hours, ongoing, description, link }
export function useVolunteer() {
  const [items, setItems] = useStored('viol_volunteer', []);
  const add = useCallback((v) => {
    setItems((list) => [{ id: `vol-${Date.now()}`, ...v }, ...list]);
  }, [setItems]);
  const update = useCallback((id, patch) => {
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, [setItems]);
  const remove = useCallback((id) => {
    setItems((list) => list.filter((x) => x.id !== id));
  }, [setItems]);
  return { items, add, update, remove };
}

// ---- Feedback (bug / feature submissions, shown on the Admin tab) -----------
//   { id, type: 'bug' | 'feature', text, when }
export function useFeedback() {
  const [items, setItems] = useStored('viol_feedback', []);
  const add = useCallback((type, text) => {
    const entry = { id: `fb-${Date.now()}`, type, text: text.trim(), when: new Date().toISOString() };
    setItems((list) => [entry, ...list]);
  }, [setItems]);
  const remove = useCallback((id) => {
    setItems((list) => list.filter((x) => x.id !== id));
  }, [setItems]);
  const clearAll = useCallback(() => setItems([]), [setItems]);
  return { items, add, remove, clearAll };
}

// ---- Writing pieces (stories, poems, plays, D&D, college essays) ------------
//   { id, category, status, title, body, date, favorite,
//     prompt, school, wordLimit, link }
export function useWriting() {
  const [items, setItems] = useStored('viol_writing', []);
  const add = useCallback((w) => {
    const entry = {
      id: `wr-${Date.now()}`,
      category: 'story', status: 'idea', title: '', body: '',
      date: '', favorite: false, prompt: '', school: '', wordLimit: '', link: '',
      ...w,
    };
    setItems((list) => [entry, ...list]);
    return entry.id;
  }, [setItems]);
  const update = useCallback((id, patch) => {
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, [setItems]);
  const remove = useCallback((id) => {
    setItems((list) => list.filter((x) => x.id !== id));
  }, [setItems]);
  return { items, add, update, remove };
}

// Count words in a writing body (used by the live counter + dashboard).
export function wordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Map a volunteer record to the event shape used by Checklist + Calendar.
export function volunteerToEvent(v) {
  const bits = [];
  if (v.hours) bits.push(`${v.hours} hr${Number(v.hours) === 1 ? '' : 's'}`);
  if (v.ongoing) bits.push('ongoing');
  if (v.description) bits.push(v.description);
  return {
    id: v.id,
    date: v.date || '',
    category: 'volunteer',
    title: v.role ? `${v.role} — ${v.org}` : (v.org || 'Volunteer work'),
    detail: bits.join(' · '),
    link: v.link || '',
    volunteer: true,
  };
}

// ---- Light / dark theme -----------------------------------------------------
export function useTheme() {
  const [theme, setTheme] = useStored('viol_theme', 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);
  return { theme, toggle };
}

// ---- Browser download helpers ----------------------------------------------
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(filename, url);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function triggerDownload(filename, href) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
