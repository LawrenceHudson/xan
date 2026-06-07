import { useState } from 'react';
import { COLLEGES, SCHOLARSHIPS, PORTFOLIO } from '../../shared/roadmap.js';
import { useStored, fmt, daysUntil } from '../lib/util.js';

const STATUS = {
  idea:          { label: 'Idea',        color: '#94a3b8', emoji: '💡' },
  'in-progress': { label: 'In progress', color: '#0ea5e9', emoji: '🖌️' },
  revise:        { label: 'Revise',      color: '#f59e0b', emoji: '🔁' },
  final:         { label: 'Final',       color: '#22c55e', emoji: '✅' },
};

const SCHOOL_OPTS = COLLEGES.map((c) => ({ id: c.id, label: c.name.split(' (')[0] }));
const SCH_OPTS = SCHOLARSHIPS.map((s) => ({ id: s.id, label: s.name }));

const blank = () => ({
  id: 'p' + Date.now(),
  title: '',
  medium: '',
  status: 'idea',
  schools: [],
  scholarships: [],
  notes: '',
  target: '',
  image: '',
});

export default function PortfolioTracker() {
  const [pieces, setPieces] = useStored('viol_portfolio', []);
  const [draft, setDraft] = useState(null);

  const finals = pieces.filter((p) => p.status === 'final').length;
  const pct = Math.min(100, Math.round((finals / PORTFOLIO.targetPieces) * 100));

  function save() {
    if (!draft.title.trim()) return;
    setPieces((list) => {
      const i = list.findIndex((p) => p.id === draft.id);
      if (i === -1) return [...list, draft];
      const copy = [...list];
      copy[i] = draft;
      return copy;
    });
    setDraft(null);
  }
  function remove(id) {
    setPieces((list) => list.filter((p) => p.id !== id));
  }
  function togglePublic(id) {
    setPieces((list) => list.map((p) => (p.id === id ? { ...p, public: !p.public } : p)));
  }
  function toggleTag(field, val) {
    setDraft((d) => {
      const has = d[field].includes(val);
      return { ...d, [field]: has ? d[field].filter((x) => x !== val) : [...d[field], val] };
    });
  }

  return (
    <div className="screen">
      <h2>Portfolio Tracker</h2>
      <p className="muted">Track every piece from idea → final. Tag which schools and scholarships each one is aimed at.</p>

      <div className="progress-hero">
        <div className="bar big"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <strong>{finals} / {PORTFOLIO.targetPieces} final pieces</strong>
        {finals >= PORTFOLIO.targetPieces && <span className="celebrate">🎉 Portfolio target hit!</span>}
      </div>

      <div className="pf-tips">
        <strong>💡 What makes a strong portfolio</strong>
        <ul>{PORTFOLIO.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>

      {!draft && (
        <button className="btn primary add-piece" onClick={() => setDraft(blank())}>+ Add a piece</button>
      )}

      {draft && (
        <div className="card editor">
          <div className="form-row">
            <label>Title<input autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Self-portrait in charcoal" /></label>
            <label>Medium<input value={draft.medium} onChange={(e) => setDraft({ ...draft, medium: e.target.value })} placeholder="charcoal, acrylic, digital…" /></label>
          </div>
          <div className="form-row">
            <label>Status
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {PORTFOLIO.pieceStatuses.map((s) => <option key={s} value={s}>{STATUS[s].emoji} {STATUS[s].label}</option>)}
              </select>
            </label>
            <label>Target date<input type="date" value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value })} /></label>
          </div>
          <label className="full">Image URL (optional)<input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="paste a link to a photo of the piece" /></label>

          <div className="tag-picker">
            <span className="picker-label">For schools:</span>
            {SCHOOL_OPTS.map((o) => (
              <button key={o.id} type="button" className={`chip ${draft.schools.includes(o.id) ? 'on' : ''}`} onClick={() => toggleTag('schools', o.id)}>{o.label}</button>
            ))}
          </div>
          <div className="tag-picker">
            <span className="picker-label">For scholarships:</span>
            {SCH_OPTS.map((o) => (
              <button key={o.id} type="button" className={`chip ${draft.scholarships.includes(o.id) ? 'on' : ''}`} onClick={() => toggleTag('scholarships', o.id)}>{o.label}</button>
            ))}
          </div>

          <label className="full">Feedback / notes<textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={3} placeholder="critique notes, what to fix, who reviewed it…" /></label>

          <div className="editor-actions">
            <button className="btn primary" onClick={save}>Save piece</button>
            <button className="btn ghost" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      {pieces.length === 0 && !draft && <p className="empty">No pieces yet. Add your first one above — even an idea counts.</p>}

      <div className="cards two">
        {pieces.map((p) => {
          const st = STATUS[p.status] || STATUS.idea;
          const d = p.target ? daysUntil(p.target) : null;
          return (
            <div key={p.id} className="card piece">
              {p.image && <img className="piece-img" src={p.image} alt={p.title} onError={(e) => { e.target.style.display = 'none'; }} />}
              <div className="card-head">
                <h3>{p.title}</h3>
                <span className="tag" style={{ background: st.color, color: '#fff' }}>{st.emoji} {st.label}</span>
              </div>
              {p.medium && <div className="kv"><span>Medium</span><strong>{p.medium}</strong></div>}
              {p.target && <div className="kv"><span>Target</span><strong className={d !== null && d < 14 && d >= 0 ? 'warn' : ''}>{fmt(p.target)} {d >= 0 ? `(${d}d)` : '(passed)'}</strong></div>}
              {p.schools.length > 0 && <div className="tags"><span className="micro">Schools:</span>{p.schools.map((id) => <span key={id} className="tag purple">{SCHOOL_OPTS.find((o) => o.id === id)?.label}</span>)}</div>}
              {p.scholarships.length > 0 && <div className="tags"><span className="micro">Scholarships:</span>{p.scholarships.map((id) => <span key={id} className="tag amber">{SCH_OPTS.find((o) => o.id === id)?.label}</span>)}</div>}
              {p.notes && <p className="deliverable">{p.notes}</p>}
              {p.image ? (
                <label className={`publish-toggle ${p.public ? 'on' : ''}`} title="Show this piece on your public Art Gallery wall">
                  <input type="checkbox" checked={!!p.public} onChange={() => togglePublic(p.id)} />
                  {p.public ? '🖼️ Published to Gallery' : 'Publish to Gallery'}
                </label>
              ) : (
                <span className="publish-hint muted small">Add an image URL to publish this to the public Gallery.</span>
              )}
              <div className="editor-actions">
                <button className="btn ghost" onClick={() => setDraft(p)}>Edit</button>
                <button className="btn danger" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
