import { useEffect, useState } from 'react';
import { COLLEGES, SCHOLARSHIPS, PORTFOLIO } from '../../shared/roadmap.js';
import { useStored, fmt, daysUntil, youtubeEmbedUrl } from '../lib/util.js';
import { listMedia } from '../lib/api.js';
import GalleryArranger, { PUBLIC_GALLERIES } from './GalleryArranger.jsx';

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
  caption: '',
  created: '',
  target: '',
  image: '',
  images: [],
  video: '',
  imagesText: '',
  publicCategories: [],
  hideFromOeuvre: false,
  ceramicViews: { sideA: '', front: '', sideB: '', back: '' },
});

function ceramicComplete(piece) {
  const views = piece.ceramicViews || {};
  return ['sideA', 'front', 'sideB', 'back'].every((key) => String(views[key] || '').trim());
}

function canPublishPiece(piece) {
  return !(piece.publicCategories || []).includes('ceramics') || ceramicComplete(piece);
}

export default function PortfolioTracker() {
  const [pieces, setPieces] = useStored('viol_portfolio', []);
  const [draft, setDraft] = useState(null);
  const [pubMedia, setPubMedia] = useState([]);
  const [pickUrl, setPickUrl] = useState('');

  useEffect(() => {
    (async () => {
      const res = await listMedia({ state: 'published', kind: 'image', limit: 200 });
      if (!res || !res.ok) return;
      const imgs = (res.items || []).filter((m) => m.publicUrl && String(m.type || '').startsWith('image/'));
      setPubMedia(imgs);
    })();
  }, []);

  const finals = pieces.filter((p) => p.status === 'final').length;
  const pct = Math.min(100, Math.round((finals / PORTFOLIO.targetPieces) * 100));

  function save() {
    if (!draft.title.trim()) return;
    const { imagesText, ...rest } = draft;
    const images = (imagesText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const entry = { ...rest, images };
    setPieces((list) => {
      const i = list.findIndex((p) => p.id === entry.id);
      if (i === -1) return [...list, entry];
      const copy = [...list];
      copy[i] = entry;
      return copy;
    });
    setDraft(null);
    setPickUrl('');
  }
  function remove(id) {
    setPieces((list) => list.filter((p) => p.id !== id));
  }
  function togglePublic(id) {
    setPieces((list) => list.map((p) => {
      if (p.id !== id) return p;
      if (!p.public && !canPublishPiece(p)) return p;
      return { ...p, public: !p.public };
    }));
  }
  function toggleTag(field, val) {
    setDraft((d) => {
      const values = d[field] || [];
      const has = values.includes(val);
      return { ...d, [field]: has ? values.filter((x) => x !== val) : [...values, val] };
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
          <div className="form-row">
            <label>Date created<input type="date" value={draft.created || ''} onChange={(e) => setDraft({ ...draft, created: e.target.value })} /></label>
          </div>
          <label className="full">Cover image / GIF URL (optional)<input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="paste a link to a photo (or a .gif — it'll animate)" /></label>
          {pubMedia.length > 0 && (
            <div className="form-row">
              <label className="full">Or insert from your Media Library
                <select value={pickUrl} onChange={(e) => setPickUrl(e.target.value)}>
                  <option value="">Select a published image…</option>
                  {pubMedia.map((m) => <option key={m.id} value={m.publicUrl}>{m.name}</option>)}
                </select>
              </label>
              <div className="editor-actions" style={{ marginTop: 0 }}>
                <button type="button" className="btn small ghost" onClick={() => pickUrl && setDraft({ ...draft, image: pickUrl })} disabled={!pickUrl}>Use as cover image</button>
                <button type="button" className="btn small ghost" onClick={() => pickUrl && setDraft((d) => ({ ...d, imagesText: d.imagesText ? `${d.imagesText}\n${pickUrl}` : pickUrl }))} disabled={!pickUrl}>Add to additional photos</button>
              </div>
            </div>
          )}
          <label className="full">Additional photos (optional)<textarea value={draft.imagesText} onChange={(e) => setDraft({ ...draft, imagesText: e.target.value })} rows={3} placeholder={'One photo URL per line — e.g. more angles of the same piece, or pages exported from a PDF'} /></label>
          <label className="full">Video — YouTube link (optional)<input value={draft.video} onChange={(e) => setDraft({ ...draft, video: e.target.value })} placeholder="paste a YouTube link — it plays inline, no upload needed" /></label>
          <label className="full">Gallery description (public)<textarea value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} rows={3} placeholder="A sentence or two about this piece — shown beside it on your public Art Gallery. Leave blank to show just the title and medium." /></label>

          <div className="tag-picker public-category-picker">
            <span className="picker-label">Public gallery sections:</span>
            {PUBLIC_GALLERIES.filter((g) => g.id !== 'oeuvre').map((g) => (
              <button key={g.id} type="button" className={`chip ${(draft.publicCategories || []).includes(g.id) ? 'on' : ''}`} onClick={() => toggleTag('publicCategories', g.id)}>{g.label}</button>
            ))}
            <span className="muted small full-width-hint">Every published piece appears in Oeuvre automatically. Leave all three unselected for an Oeuvre-only piece.</span>
          </div>
          <label className="check-inline">
            <input type="checkbox" checked={!!draft.hideFromOeuvre} onChange={(e) => setDraft({ ...draft, hideFromOeuvre: e.target.checked })} />
            Hide this piece from Oeuvre
          </label>

          {(draft.publicCategories || []).includes('ceramics') && (
            <div className="ceramic-editor">
              <strong>Ceramic turnaround — all four views are required to publish</strong>
              <div className="ceramic-slot-grid">
                {[
                  ['sideA', 'Side 1'], ['front', 'Front'], ['sideB', 'Side 2'], ['back', 'Back'],
                ].map(([key, label]) => (
                  <label key={key}>{label}
                    <input value={draft.ceramicViews?.[key] || ''} onChange={(e) => setDraft({ ...draft, ceramicViews: { ...(draft.ceramicViews || {}), [key]: e.target.value } })} placeholder="Image URL" />
                    {pickUrl && <button type="button" className="btn small ghost" onClick={() => setDraft({ ...draft, ceramicViews: { ...(draft.ceramicViews || {}), [key]: pickUrl } })}>Use selected media</button>}
                  </label>
                ))}
              </div>
            </div>
          )}

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
            <button className="btn ghost" onClick={() => { setDraft(null); setPickUrl(''); }}>Cancel</button>
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
              {p.image && (
                <div className="piece-img-wrap">
                  <img className="piece-img" src={p.image} alt={p.title} onError={(e) => { e.target.style.display = 'none'; }} />
                  {(p.images || []).length > 0 && <span className="tag piece-more-badge">+{p.images.length} more photo{p.images.length > 1 ? 's' : ''}</span>}
                </div>
              )}
              {p.video && (
                youtubeEmbedUrl(p.video)
                  ? <div className="video-embed"><iframe src={youtubeEmbedUrl(p.video)} title={p.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
                  : <p className="muted small">Video link didn&rsquo;t look like a YouTube URL — double check it.</p>
              )}
              <div className="card-head">
                <h3>{p.title}</h3>
                <span className="tag" style={{ background: st.color, color: '#fff' }}>{st.emoji} {st.label}</span>
              </div>
              {p.medium && <div className="kv"><span>Medium</span><strong>{p.medium}</strong></div>}
              {p.target && <div className="kv"><span>Target</span><strong className={d !== null && d < 14 && d >= 0 ? 'warn' : ''}>{fmt(p.target)} {d >= 0 ? `(${d}d)` : '(passed)'}</strong></div>}
              {p.created && <div className="kv"><span>Created</span><strong>{fmt(p.created)}</strong></div>}
              {p.schools.length > 0 && <div className="tags"><span className="micro">Schools:</span>{p.schools.map((id) => <span key={id} className="tag purple">{SCHOOL_OPTS.find((o) => o.id === id)?.label}</span>)}</div>}
              {p.scholarships.length > 0 && <div className="tags"><span className="micro">Scholarships:</span>{p.scholarships.map((id) => <span key={id} className="tag amber">{SCH_OPTS.find((o) => o.id === id)?.label}</span>)}</div>}
              {p.notes && <p className="deliverable">{p.notes}</p>}
              {(p.publicCategories || []).length > 0 && (
                <div className="tags"><span className="micro">Public sections:</span>{p.publicCategories.map((id) => <span key={id} className="tag purple">{PUBLIC_GALLERIES.find((g) => g.id === id)?.label || id}</span>)}</div>
              )}
              {p.hideFromOeuvre && <span className="tag">Hidden from Oeuvre</span>}
              {(p.publicCategories || []).includes('ceramics') && !ceramicComplete(p) && <p className="publish-hint muted small">Add all four ceramic views before publishing.</p>}
              {(p.image || p.video || ceramicComplete(p)) ? (
                <label className={`publish-toggle ${p.public ? 'on' : ''}`} title="Show this piece on your public Art Gallery wall">
                  <input type="checkbox" checked={!!p.public} disabled={!p.public && !canPublishPiece(p)} onChange={() => togglePublic(p.id)} />
                  {p.public ? '🖼️ Published to Gallery' : 'Publish to Gallery'}
                </label>
              ) : (
                <span className="publish-hint muted small">Add an image URL or a YouTube link to publish this to the public Gallery.</span>
              )}
              <div className="editor-actions">
                <button className="btn ghost" onClick={() => { setPickUrl(''); setDraft({ ...blank(), ...p, imagesText: (p.images || []).join('\n') }); }}>Edit</button>
                <button className="btn danger" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
      <GalleryArranger pieces={pieces} />
    </div>
  );
}
