import { useState } from 'react';
import { WRITING_CATEGORIES, WRITING_GUIDE, STUDENT } from '../../shared/roadmap.js';
import { useWriting, wordCount, fmt, downloadText } from '../lib/util.js';

const STATUS = WRITING_GUIDE.statuses;
const BLANK = {
  category: 'story', status: 'idea', title: '', body: '', date: '',
  favorite: false, prompt: '', school: '', wordLimit: '', link: '',
};

export default function Writing() {
  const { items, add, update, remove } = useWriting();
  const [draft, setDraft] = useState(BLANK);
  const [editing, setEditing] = useState(null); // id, or 'new', or null
  const [filter, setFilter] = useState('all');
  const [tips, setTips] = useState(false);

  function startNew() { setDraft(BLANK); setEditing('new'); }
  function startEdit(it) { setDraft({ ...BLANK, ...it }); setEditing(it.id); }
  function cancel() { setEditing(null); setDraft(BLANK); }

  function save() {
    if (!draft.title.trim() && !draft.body.trim()) return;
    if (editing === 'new') add(draft);
    else update(editing, draft);
    cancel();
  }

  function exportOne(it) {
    const cat = WRITING_CATEGORIES[it.category] || { label: 'Writing' };
    const head = [
      it.title || 'Untitled',
      `${cat.label}${it.date ? ' · ' + fmt(it.date) : ''}`,
    ];
    if (it.category === 'essay') {
      if (it.school) head.push(`School: ${it.school}`);
      if (it.prompt) head.push(`Prompt: ${it.prompt}`);
      if (it.wordLimit) head.push(`Word limit: ${it.wordLimit}`);
    }
    head.push('='.repeat(40), '');
    const safe = (it.title || 'untitled').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    downloadText(`${STUDENT.name}-${safe}.txt`, head.join('\n') + (it.body || ''));
  }

  const shown = items.filter((w) => (filter === 'all' ? true : w.category === filter));
  const sorted = [...shown].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return (b.date || b.id).localeCompare(a.date || a.id);
  });

  const liveCount = wordCount(draft.body);
  const overLimit = draft.category === 'essay' && draft.wordLimit && liveCount > Number(draft.wordLimit);

  return (
    <div className="screen">
      <h2>Writing Portfolio</h2>
      <p className="muted">{WRITING_GUIDE.intro}</p>

      <div className="filters">
        <button className="btn primary" onClick={startNew}>+ New piece</button>
        <button className="btn ghost" onClick={() => setTips((v) => !v)}>{tips ? 'Hide tips' : 'Writing tips'}</button>
        <span className="hidedone">{items.length} piece{items.length === 1 ? '' : 's'}</span>
      </div>

      {tips && (
        <div className="card tinted">
          <ul className="tip-list">
            {WRITING_GUIDE.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      <div className="filters wrap">
        <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All</button>
        {Object.entries(WRITING_CATEGORIES).map(([k, c]) => (
          <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {editing && (
        <div className="card editor">
          <h3 style={{ margin: 0 }}>{editing === 'new' ? 'New writing piece' : 'Edit piece'}</h3>
          <div className="form-row">
            <label className="full">Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g., The Lantern Keeper" />
            </label>
          </div>
          <div className="form-row">
            <label>Type
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {Object.entries(WRITING_CATEGORIES).map(([k, c]) => (
                  <option key={k} value={k}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </label>
            <label>Status
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {STATUS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
              </select>
            </label>
            <label>Date
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
          </div>

          {draft.category === 'essay' && (
            <>
              <div className="form-row">
                <label>School
                  <input value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} placeholder="RISD, MassArt, MECA&D…" />
                </label>
                <label>Word limit
                  <input type="number" min="0" value={draft.wordLimit} onChange={(e) => setDraft({ ...draft, wordLimit: e.target.value })} placeholder="650" list="essay-limits" />
                  <datalist id="essay-limits">
                    {WRITING_GUIDE.essayLimits.map((n) => <option key={n} value={n} />)}
                  </datalist>
                </label>
              </div>
              <div className="form-row">
                <label className="full">Prompt
                  <textarea rows="2" value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} placeholder="Paste the essay prompt you’re answering…" />
                </label>
              </div>
            </>
          )}

          <div className="form-row">
            <label className="full">
              <span className="label-row">
                <span>Body</span>
                <span className={`wc ${overLimit ? 'over' : ''}`}>
                  {liveCount} word{liveCount === 1 ? '' : 's'}
                  {draft.category === 'essay' && draft.wordLimit ? ` / ${draft.wordLimit}` : ''}
                </span>
              </span>
              <textarea rows="12" className="writing-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Write or paste your piece here…" />
            </label>
          </div>

          <div className="form-row">
            <label className="full">Link (optional — Google Doc, etc.)
              <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
            </label>
          </div>

          <label className="check-inline">
            <input type="checkbox" checked={draft.favorite} onChange={(e) => setDraft({ ...draft, favorite: e.target.checked })} />
            ⭐ Feature this piece (pin to top)
          </label>

          <div className="editor-actions">
            <button className="btn" onClick={save}>Save</button>
            <button className="btn ghost" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !editing && (
        <p className="empty">No writing here yet. Click <strong>+ New piece</strong> to add a story, poem, play, D&D campaign, or college essay.</p>
      )}

      <div className="cards two">
        {sorted.map((it) => {
          const c = WRITING_CATEGORIES[it.category] || { label: 'Writing', emoji: '✍️', color: '#6b7280' };
          const st = STATUS.find((s) => s.id === it.status) || STATUS[0];
          const wc = wordCount(it.body);
          return (
            <div key={it.id} className="card writing">
              <div className="card-head">
                <h3>{it.favorite ? '⭐ ' : ''}{c.emoji} {it.title || 'Untitled'}</h3>
                <span className="tag" style={{ background: c.color, color: '#fff' }}>{c.label}</span>
              </div>
              <div className="writing-meta">
                <span className="pill">{st.emoji} {st.label}</span>
                {wc > 0 && <span className="muted small">{wc} words</span>}
                {it.date && <span className="muted small">{fmt(it.date)}</span>}
              </div>
              {it.category === 'essay' && (it.school || it.wordLimit) && (
                <div className="kv"><span>Essay</span><strong>{it.school || '—'}{it.wordLimit ? ` · ${wc}/${it.wordLimit} words` : ''}</strong></div>
              )}
              {it.category === 'essay' && it.prompt && <p className="deliverable"><em>{it.prompt}</em></p>}
              {it.body && <p className="writing-excerpt">{it.body.slice(0, 220)}{it.body.length > 220 ? '…' : ''}</p>}
              <div className="publish-row">
                <label className={`publish-toggle ${it.public ? 'on' : ''}`} title="Show this in your public 'The Ink & Page'">
                  <input type="checkbox" checked={!!it.public} onChange={() => update(it.id, { public: !it.public })} />
                  {it.public ? '📖 Published to Ink & Page' : 'Publish to Ink & Page'}
                </label>
                {it.public && (
                  <label className="publish-sub" title="Show the whole piece publicly (otherwise just a short excerpt)">
                    <input type="checkbox" checked={!!it.publicFull} onChange={() => update(it.id, { publicFull: !it.publicFull })} />
                    Show full text
                  </label>
                )}
              </div>
              <div className="editor-actions">
                <button className="btn small ghost" onClick={() => startEdit(it)}>Open / Edit</button>
                <button className="btn small ghost" onClick={() => exportOne(it)} disabled={!it.body}>⬇ .txt</button>
                {it.link && <a className="btn small" href={it.link} target="_blank" rel="noreferrer">Link ↗</a>}
                <button className="btn small danger" onClick={() => remove(it.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
