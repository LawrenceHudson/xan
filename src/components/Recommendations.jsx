import { useRef, useState } from 'react';
import { RECOMMENDATIONS_GUIDE } from '../../shared/roadmap.js';
import { useStored, triggerDownload } from '../lib/util.js';

const MAX_BYTES = RECOMMENDATIONS_GUIDE.maxBytes;

const STATUS = RECOMMENDATIONS_GUIDE.statuses;
const STATUS_BY_ID = Object.fromEntries(STATUS.map((s) => [s.id, s]));

function blank() {
  return { recommender: '', role: '', schools: '', status: 'asked', asked: '', due: '', notes: '' };
}

export default function Recommendations() {
  const [recs, setRecs] = useStored('viol_recs', []);
  const [editing, setEditing] = useState(null); // 'new' | id | null
  const [draft, setDraft] = useState(blank());

  function startNew() {
    setDraft(blank());
    setEditing('new');
  }

  function startEdit(r) {
    setDraft({
      recommender: r.recommender || '', role: r.role || '', schools: r.schools || '',
      status: r.status || 'asked', asked: r.asked || '', due: r.due || '', notes: r.notes || '',
    });
    setEditing(r.id);
  }

  function cancel() {
    setEditing(null);
    setDraft(blank());
  }

  function save() {
    if (!draft.recommender.trim()) {
      alert('Add a recommender name first.');
      return;
    }
    if (editing === 'new') {
      setRecs((list) => [{ id: `rec-${Date.now()}`, file: null, ...draft }, ...list]);
    } else {
      setRecs((list) => list.map((x) => (x.id === editing ? { ...x, ...draft } : x)));
    }
    cancel();
  }

  function remove(id) {
    if (!confirm('Remove this recommender and any stored letter?')) return;
    setRecs((list) => list.filter((x) => x.id !== id));
  }

  function attachFile(id, file) {
    setRecs((list) => list.map((x) => (x.id === id ? { ...x, file } : x)));
  }

  return (
    <div className="screen">
      <h2>Recommendations</h2>
      <p className="muted">{RECOMMENDATIONS_GUIDE.intro}</p>

      <div className="pf-tips">
        <strong>✉️ How to ask</strong>
        <ul>{RECOMMENDATIONS_GUIDE.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>

      <DocVault />

      <h3 style={{ marginBottom: 4 }}>Recommenders</h3>
      <div className="editor-actions" style={{ marginBottom: 14 }}>
        {editing !== 'new' && <button className="btn small" onClick={startNew}>＋ Add recommender</button>}
      </div>

      {editing === 'new' && (
        <RecForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} title="New recommender" />
      )}

      {recs.length === 0 && editing !== 'new' && (
        <p className="muted small">No recommenders yet. Add the teacher or counselor you plan to ask — then store their letter here when it&rsquo;s ready.</p>
      )}

      <div className="cards two">
        {recs.map((r) => (
          editing === r.id ? (
            <RecForm key={r.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} title="Edit recommender" />
          ) : (
            <RecCard
              key={r.id}
              rec={r}
              onEdit={() => startEdit(r)}
              onRemove={() => remove(r.id)}
              onAttach={(file) => attachFile(r.id, file)}
              maxBytes={RECOMMENDATIONS_GUIDE.maxBytes}
            />
          )
        ))}
      </div>
    </div>
  );
}

function DocVault() {
  const [docs, setDocs] = useStored('viol_rec_docs', []);
  const inputRef = useRef(null);

  function onPick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    files.forEach((f) => {
      if (f.size > MAX_BYTES) {
        alert(`“${f.name}” is too big to store in the browser (max ~${Math.round(MAX_BYTES / (1024 * 1024) * 10) / 10} MB). Try saving it as a compact PDF.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDocs((list) => [
          { id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, type: f.type, dataUrl: reader.result, when: new Date().toISOString().slice(0, 10) },
          ...list,
        ]);
      };
      reader.readAsDataURL(f);
    });
  }

  function removeDoc(id) {
    if (!confirm('Remove this document?')) return;
    setDocs((list) => list.filter((d) => d.id !== id));
  }

  return (
    <div className="card editor" style={{ marginBottom: 18 }}>
      <div className="card-head">
        <h3 style={{ margin: 0 }}>📎 Letters &amp; documents</h3>
        <button className="btn small" onClick={() => inputRef.current?.click()}>⬆ Upload document</button>
      </div>
      <p className="muted small" style={{ margin: '4px 0 10px' }}>
        Store any Word or PDF here — a general recommendation letter, a brag sheet, a résumé copy — and download it whenever you need to attach it. Not tied to a single recommender. Saved in this browser.
      </p>

      {docs.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>No documents yet. Upload a Word or PDF file to keep it ready.</p>
      ) : (
        <div className="cost-box">
          {docs.map((d) => (
            <div key={d.id} className="kv" style={{ alignItems: 'center' }}>
              <span>📄 {d.name}</span>
              <span className="editor-actions" style={{ margin: 0 }}>
                <span className="muted small" style={{ marginRight: 8 }}>{d.when}</span>
                <button className="btn small" onClick={() => triggerDownload(d.name, d.dataUrl)}>⬇ Download</button>
                <button className="btn small danger" onClick={() => removeDoc(d.id)}>Remove</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,application/pdf" style={{ display: 'none' }} onChange={onPick} />
    </div>
  );
}

function RecForm({ draft, setDraft, onSave, onCancel, title }) {
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="card editor">
      <h3 style={{ margin: 0 }}>{title}</h3>
      <div className="form-row">
        <label className="full">Recommender
          <input value={draft.recommender} onChange={set('recommender')} placeholder="e.g. Ms. Rivera" />
        </label>
      </div>
      <div className="form-row">
        <label>Relationship / role
          <input value={draft.role} onChange={set('role')} placeholder="e.g. AP Art teacher" />
        </label>
        <label>For which school(s)
          <input value={draft.schools} onChange={set('schools')} placeholder="MassArt, RISD — or “general”" />
        </label>
      </div>
      <div className="form-row">
        <label>Status
          <select value={draft.status} onChange={set('status')}>
            {STATUS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
          </select>
        </label>
        <label>Asked on
          <input type="date" value={draft.asked} onChange={set('asked')} />
        </label>
        <label>Needed by
          <input type="date" value={draft.due} onChange={set('due')} />
        </label>
      </div>
      <div className="form-row">
        <label className="full">Notes
          <textarea rows="2" value={draft.notes} onChange={set('notes')} placeholder="What you gave them, thank-you sent, etc." />
        </label>
      </div>
      <div className="editor-actions">
        <button className="btn" onClick={onSave}>Save</button>
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function RecCard({ rec, onEdit, onRemove, onAttach, maxBytes }) {
  const inputRef = useRef(null);
  const st = STATUS_BY_ID[rec.status] || STATUS[0];

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxBytes) {
      alert(`That file is too big to store in the browser (max ~${Math.round(maxBytes / (1024 * 1024) * 10) / 10} MB). Try saving the letter as a compact PDF.`);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onAttach({ name: f.name, type: f.type, dataUrl: reader.result, when: new Date().toISOString().slice(0, 10) });
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  function download() {
    if (rec.file?.dataUrl) triggerDownload(rec.file.name || `${rec.recommender}-letter`, rec.file.dataUrl);
  }

  return (
    <div className="card rec-card">
      <div className="card-head">
        <h3>{rec.recommender}</h3>
        <span className="pill">{st.emoji} {st.label}</span>
      </div>
      {rec.role && <p className="deliverable">{rec.role}</p>}

      <div className="cost-box">
        {rec.schools && <div className="kv"><span>For</span><strong>{rec.schools}</strong></div>}
        {rec.asked && <div className="kv"><span>Asked</span><strong>{rec.asked}</strong></div>}
        {rec.due && <div className="kv"><span>Needed by</span><strong>{rec.due}</strong></div>}
        {rec.notes && <div className="kv"><span>Notes</span><strong>{rec.notes}</strong></div>}
      </div>

      <div className="cost-box">
        {rec.file ? (
          <>
            <div className="kv"><span>Letter</span><strong>{rec.file.name}</strong></div>
            <div className="kv"><span>Saved</span><strong>{rec.file.when}</strong></div>
            <div className="editor-actions">
              <button className="btn small" onClick={download}>⬇ Download</button>
              <button className="btn small ghost" onClick={() => inputRef.current?.click()}>Replace</button>
            </div>
          </>
        ) : (
          <>
            <p className="muted small" style={{ margin: '4px 0 8px' }}>No letter stored yet. Upload the finished letter (PDF or DOC) to keep it ready.</p>
            <button className="btn small" onClick={() => inputRef.current?.click()}>⬆ Upload letter</button>
          </>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf" style={{ display: 'none' }} onChange={onPick} />
      </div>

      <div className="editor-actions">
        <button className="btn small ghost" onClick={onEdit}>Edit</button>
        <button className="btn small danger" onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}
