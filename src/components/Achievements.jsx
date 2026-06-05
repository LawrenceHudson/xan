import { useState } from 'react';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_SEEDS, STUDENT } from '../../shared/roadmap.js';
import { useStored, fmt, downloadText } from '../lib/util.js';

const BLANK = { category: 'award', title: '', venue: '', date: '', description: '', link: '', image: '' };

export default function Achievements() {
  const [items, setItems] = useStored('viol_achievements', ACHIEVEMENT_SEEDS.map((s, i) => ({ id: `seed-${i}`, ...s })));
  const [draft, setDraft] = useState(BLANK);
  const [editing, setEditing] = useState(null); // id being edited, or 'new'
  const [lightbox, setLightbox] = useState(null); // achievement being viewed full-size

  function startNew() { setDraft(BLANK); setEditing('new'); }
  function startEdit(it) { setDraft({ ...BLANK, ...it }); setEditing(it.id); }
  function cancel() { setEditing(null); setDraft(BLANK); }

  function save() {
    if (!draft.title.trim()) return;
    if (editing === 'new') {
      setItems((l) => [{ id: `ach-${Date.now()}`, ...draft }, ...l]);
    } else {
      setItems((l) => l.map((x) => (x.id === editing ? { ...x, ...draft } : x)));
    }
    cancel();
  }
  function remove(id) { setItems((l) => l.filter((x) => x.id !== id)); }

  function exportTxt() {
    const lines = [
      `${STUDENT.name}'s Achievements`,
      `Exported ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      '='.repeat(40), '',
    ];
    if (items.length === 0) lines.push('(No achievements logged yet.)');
    items.forEach((it, i) => {
      const cat = ACHIEVEMENT_CATEGORIES[it.category] || { label: 'Other', emoji: '•' };
      lines.push(`${i + 1}. ${it.title}`);
      lines.push(`   Category: ${cat.emoji} ${cat.label}`);
      if (it.venue) lines.push(`   Where: ${it.venue}`);
      if (it.date) lines.push(`   Date: ${fmt(it.date)}`);
      if (it.description) lines.push(`   Notes: ${it.description}`);
      if (it.image) lines.push(`   Image: ${it.image}`);
      if (it.link) lines.push(`   Link: ${it.link}`);
      lines.push('');
    });
    downloadText(`${STUDENT.name}-achievements.txt`, lines.join('\n'));
  }

  const sorted = [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="screen">
      <h2>Achievements</h2>
      <p className="muted">Every big win, in one place — awards, shows, sales, publications. These power your résumé and applications. 🏆</p>

      <div className="filters">
        <button className="btn primary" onClick={startNew}>+ Add achievement</button>
        <button className="btn ghost" onClick={exportTxt} disabled={items.length === 0}>⬇ Export as TXT</button>
        <span className="hidedone">{items.length} logged</span>
      </div>

      {editing && (
        <div className="card editor">
          <h3 style={{ margin: 0 }}>{editing === 'new' ? 'New achievement' : 'Edit achievement'}</h3>
          <div className="form-row">
            <label className="full">Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g., Won the Art 2026 award" />
            </label>
          </div>
          <div className="form-row">
            <label>Category
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {Object.entries(ACHIEVEMENT_CATEGORIES).map(([k, c]) => (
                  <option key={k} value={k}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </label>
            <label>Where / venue
              <input value={draft.venue} onChange={(e) => setDraft({ ...draft, venue: e.target.value })} placeholder="AVA Gallery" />
            </label>
            <label>Date
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
          </div>
          <div className="form-row">
            <label className="full">Notes
              <textarea rows="2" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What was it? Why does it matter?" />
            </label>
          </div>
          <div className="form-row">
            <label className="full">Image URL (optional)
              <input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="https://…/your-artwork.jpg" />
              <span className="muted small">Paste a link to a photo of the piece — it shows on the card and opens full-size when clicked.</span>
            </label>
          </div>
          {draft.image && (
            <div className="form-row">
              <div className="ach-preview">
                <img src={draft.image} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            </div>
          )}
          <div className="form-row">
            <label className="full">Link (optional)
              <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
            </label>
          </div>
          <div className="editor-actions">
            <button className="btn" onClick={save}>Save</button>
            <button className="btn ghost" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !editing && (
        <p className="muted">No achievements yet. Click <strong>+ Add achievement</strong> to log your first win.</p>
      )}

      <div className="cards two">
        {sorted.map((it) => {
          const c = ACHIEVEMENT_CATEGORIES[it.category] || { label: 'Other', emoji: '•', color: '#6b7280' };
          return (
            <div key={it.id} className="card achievement">
              <div className="card-head">
                <h3>{c.emoji} {it.title}</h3>
                <span className="tag" style={{ background: c.color, color: '#fff' }}>{c.label}</span>
              </div>
              {it.image && (
                <button type="button" className="ach-thumb" onClick={() => setLightbox(it)} title="Click to view full size">
                  <img src={it.image} alt={it.title} onError={(e) => { e.target.closest('.ach-thumb').classList.add('noimg'); }} />
                </button>
              )}
              {it.venue && <div className="kv"><span>Where</span><strong>{it.venue}</strong></div>}
              {it.date && <div className="kv"><span>Date</span><strong>{fmt(it.date)}</strong></div>}
              {it.description && <p className="deliverable">{it.description}</p>}
              {it.link && <a className="btn small" href={it.link} target="_blank" rel="noreferrer">Open ↗</a>}
              <div className="editor-actions">
                <button className="btn small ghost" onClick={() => startEdit(it)}>Edit</button>
                <button className="btn small danger" onClick={() => remove(it.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div className="modal-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.image} alt={lightbox.title} />
            <div className="lightbox-meta">
              <strong>{lightbox.title}</strong>
              {lightbox.venue && <span className="muted"> · {lightbox.venue}</span>}
              {lightbox.description && <p>{lightbox.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
