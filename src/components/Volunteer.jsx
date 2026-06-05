import { useState } from 'react';
import { VOLUNTEER_GUIDE } from '../../shared/roadmap.js';
import { useVolunteer, fmt } from '../lib/util.js';

const BLANK = { org: '', role: '', date: '', hours: '', ongoing: false, description: '', link: '' };

export default function Volunteer() {
  const { items, add, update, remove } = useVolunteer();
  const [draft, setDraft] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const totalHours = items.reduce((s, v) => s + (Number(v.hours) || 0), 0);

  function startNew() { setDraft(BLANK); setEditing('new'); }
  function startEdit(v) { setDraft({ ...BLANK, ...v }); setEditing(v.id); }
  function cancel() { setEditing(null); setDraft(BLANK); }

  function save() {
    if (!draft.org.trim()) return;
    if (editing === 'new') add(draft);
    else update(editing, draft);
    cancel();
  }

  const sorted = [...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="screen">
      <h2>Volunteer Work</h2>
      <p className="muted">{VOLUNTEER_GUIDE.intro}</p>

      <div className="cards">
        <div className="card stat highlight">
          <div className="stat-num">{totalHours}</div>
          <div className="stat-label">Total hours logged</div>
        </div>
        <div className="card stat">
          <div className="stat-num">{items.length}</div>
          <div className="stat-label">Activities</div>
        </div>
      </div>

      <div className="pf-tips">
        <strong>💡 Tips</strong>
        <ul>{VOLUNTEER_GUIDE.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>

      <div className="filters">
        <button className="btn primary" onClick={startNew}>+ Log volunteer work</button>
        <span className="hidedone">These also show on your Roadmap ✅</span>
      </div>

      {editing && (
        <div className="card editor">
          <h3 style={{ margin: 0 }}>{editing === 'new' ? 'New volunteer entry' : 'Edit entry'}</h3>
          <div className="form-row">
            <label>Organization
              <input value={draft.org} onChange={(e) => setDraft({ ...draft, org: e.target.value })} placeholder="e.g., AVA Gallery" />
            </label>
            <label>Role
              <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="e.g., Kids' art class helper" />
            </label>
          </div>
          <div className="form-row">
            <label>Date
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
            <label>Hours
              <input type="number" step="0.5" min="0" value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} placeholder="e.g., 4" />
            </label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={draft.ongoing} onChange={(e) => setDraft({ ...draft, ongoing: e.target.checked })} /> Ongoing
            </label>
          </div>
          <div className="form-row">
            <label className="full">What did you do?
              <textarea rows="2" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Short description for your résumé later." />
            </label>
          </div>
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
        <p className="muted">Nothing logged yet. Click <strong>+ Log volunteer work</strong> to add your first activity.</p>
      )}

      <ul className="evlist">
        {sorted.map((v) => (
          <li key={v.id} className="evrow soon">
            <div className="evmeta" style={{ flex: 1 }}>
              <span className="pill" style={{ background: '#0891b2' }}>🤝 Volunteer</span>
              <strong>{v.role ? `${v.role} — ${v.org}` : v.org}</strong>
              <span className="muted small">
                {v.date ? fmt(v.date) : 'No date'}
                {v.hours ? ` · ${v.hours} hr${Number(v.hours) === 1 ? '' : 's'}` : ''}
                {v.ongoing ? ' · ongoing' : ''}
              </span>
              {v.description && <span className="detail">{v.description}</span>}
              {v.link && <a className="extlink" href={v.link} target="_blank" rel="noreferrer">Open ↗</a>}
              <div className="editor-actions">
                <button className="btn small ghost" onClick={() => startEdit(v)}>Edit</button>
                <button className="btn small danger" onClick={() => remove(v.id)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
