import { useEffect, useState } from 'react';
import { APP_VERSION, CHANGELOG } from '../../shared/version.js';
import { DEFAULT_ABOUT, newCvEntry } from '../../shared/about.js';
import { fmt, useFeedback, useStored } from '../lib/util.js';
import { listMedia, uploadMedia, patchMedia, deleteMedia } from '../lib/api.js';

function whenLabel(iso) {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

export default function Admin() {
  const [status, setStatus] = useState(null); // null | 'sending' | {ok, msg}
  const { items: feedback, add: addFeedback, remove: removeFeedback, clearAll: clearFeedback } = useFeedback();
  const [fbType, setFbType] = useState('bug');
  const [fbText, setFbText] = useState('');

  const [about, setAbout] = useStored('viol_about', DEFAULT_ABOUT);
  const [aboutDraft, setAboutDraft] = useState(() => ({ ...DEFAULT_ABOUT, ...about, cv: about.cv || [] }));
  const [aboutSaved, setAboutSaved] = useState(false);
  const [media, setMedia] = useState([]);
  const [mediaState, setMediaState] = useState('all');
  const [mediaMsg, setMediaMsg] = useState('');
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishOnUpload, setPublishOnUpload] = useState(true);

  useEffect(() => {
    refreshMedia();
  }, [mediaState]);

  useEffect(() => {
    setAboutDraft({ ...DEFAULT_ABOUT, ...about, cv: about.cv || [] });
  }, [about]);

  function saveAbout() {
    setAbout(aboutDraft);
    setAboutSaved(true);
    setTimeout(() => setAboutSaved(false), 1500);
  }

  function updateCv(id, field, value) {
    setAboutDraft((current) => ({ ...current, cv: current.cv.map((item) => item.id === id ? { ...item, [field]: value } : item) }));
  }

  function removeCv(id) {
    setAboutDraft((current) => ({ ...current, cv: current.cv.filter((item) => item.id !== id) }));
  }

  function submitFeedback() {
    if (!fbText.trim()) return;
    addFeedback(fbType, fbText);
    setFbText('');
  }

  async function sendTest() {
    setStatus('sending');
    try {
      const resp = await fetch('/api/send-reminders?test=1');
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.ok) {
        setStatus({ ok: true, msg: `Sent ✓ ${data.to ? `to ${(data.to || []).join(', ')}` : ''}` });
      } else {
        setStatus({ ok: false, msg: data.reason || data.error || `Failed (HTTP ${resp.status}). Check the Resend env vars in Vercel.` });
      }
    } catch {
      setStatus({ ok: false, msg: 'Could not reach the email endpoint. This button works on the deployed site (Vercel), not in local preview without the API running.' });
    }
  }

  async function refreshMedia() {
    setMediaLoading(true);
    setMediaMsg('');
    const state = mediaState === 'all' ? undefined : mediaState;
    const res = await listMedia({ state, limit: 200 });
    if (res && res.ok) {
      setMedia(res.items || []);
    } else {
      setMedia([]);
      setMediaMsg('Could not load media library right now. Check Supabase media setup and API auth.');
    }
    setMediaLoading(false);
  }

  async function onUploadFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setMediaMsg('');

    let okCount = 0;
    let failCount = 0;
    for (const f of files) {
      try {
        const dataUrl = await fileToDataUrl(f);
        const res = await uploadMedia({
          name: f.name,
          type: f.type,
          dataUrl,
          publish: publishOnUpload,
          kind: f.type.startsWith('image/') ? 'image' : 'file',
        });
        if (res && res.ok) okCount += 1;
        else failCount += 1;
      } catch {
        failCount += 1;
      }
    }

    setUploading(false);
    await refreshMedia();
    setMediaMsg(`Upload complete. ${okCount} succeeded${failCount ? `, ${failCount} failed` : ''}.`);
  }

  async function actionMedia(id, action) {
    const res = await patchMedia({ id, action });
    if (!res || !res.ok) {
      setMediaMsg(`Could not ${action} this media item.`);
      return;
    }
    await refreshMedia();
  }

  async function removeMedia(id) {
    const yes = confirm('Soft-delete this media item? You can restore it during the grace period.');
    if (!yes) return;
    const res = await deleteMedia(id);
    if (!res || !res.ok) {
      setMediaMsg('Could not delete this media item.');
      return;
    }
    await refreshMedia();
  }

  async function copyUrl(url) {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMediaMsg('Copied public URL to clipboard.');
    } catch {
      setMediaMsg('Could not access clipboard. Copy the URL manually from the link.');
    }
  }

  return (
    <div className="screen">
      <h2>Admin</h2>
      <p className="muted">Behind-the-scenes tools and the change history for this app. 🛠️</p>

      <div className="cards">
        <div className="card stat highlight">
          <div className="stat-num">v{APP_VERSION}</div>
          <div className="stat-label">Current version</div>
        </div>
        <div className="card stat">
          <div className="stat-num">{CHANGELOG.length}</div>
          <div className="stat-label">Releases</div>
        </div>
      </div>

      <section>
        <h3>📧 Test email</h3>
        <p className="muted small">Sends a one-off email to the reminder recipients so you can confirm delivery is working. Uses the Resend settings configured in Vercel.</p>
        <div className="editor-actions">
          <button className="btn primary" onClick={sendTest} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send test email'}
          </button>
        </div>
        {status && status !== 'sending' && (
          <p className={status.ok ? 'celebrate' : 'danger'} style={{ marginTop: 8 }}>{status.msg}</p>
        )}
      </section>

      <section>
        <h3>🎨 Public About page</h3>
        <p className="muted small">Manage the biography, artist statement, and CV shown on the public About page. The site handles the typography and layout automatically.</p>
        <div className="card editor about-editor">
          <label className="full">Artist bio
            <textarea rows="12" value={aboutDraft.bio} onChange={(e) => setAboutDraft({ ...aboutDraft, bio: e.target.value })} />
          </label>
          <label className="full">Artist statement
            <textarea rows="16" value={aboutDraft.statement} onChange={(e) => setAboutDraft({ ...aboutDraft, statement: e.target.value })} />
          </label>

          <div className="about-cv-head">
            <div><strong>Artist CV</strong><p className="muted small">Add exhibitions, awards, education, publications, and professional projects.</p></div>
            <button type="button" className="btn small ghost" onClick={() => setAboutDraft((current) => ({ ...current, cv: [...current.cv, newCvEntry()] }))}>+ Add CV listing</button>
          </div>
          <div className="about-cv-list">
            {aboutDraft.cv.length === 0 && <p className="muted small">No CV listings yet.</p>}
            {aboutDraft.cv.map((item) => (
              <div className="about-cv-item" key={item.id}>
                <div className="form-row">
                  <label>Year<input value={item.year} onChange={(e) => updateCv(item.id, 'year', e.target.value)} placeholder="2026" /></label>
                  <label>Title<input value={item.title} onChange={(e) => updateCv(item.id, 'title', e.target.value)} placeholder="Exhibition, award, publication…" /></label>
                </div>
                <label className="full">Organization / venue<input value={item.organization} onChange={(e) => updateCv(item.id, 'organization', e.target.value)} /></label>
                <label className="full">Details<textarea rows="2" value={item.details} onChange={(e) => updateCv(item.id, 'details', e.target.value)} /></label>
                <label className="full">Link (optional)<input type="url" value={item.link} onChange={(e) => updateCv(item.id, 'link', e.target.value)} /></label>
                <button type="button" className="btn small danger" onClick={() => removeCv(item.id)}>Remove listing</button>
              </div>
            ))}
          </div>
          <div className="editor-actions">
            <button className="btn primary" onClick={saveAbout}>Save About page</button>
            {aboutSaved && <span className="celebrate">Saved ✓</span>}
          </div>
        </div>
      </section>

      <section>
        <h3>🗂️ Media library</h3>
        <p className="muted small">Upload images/docs once, publish when ready, and copy stable first-party URLs to use across Achievements, Portfolio, and other fields.</p>
        <div className="card editor">
          <div className="form-row">
            <label className="full">Upload files (max 25MB each)
              <input type="file" multiple onChange={onUploadFiles} disabled={uploading} />
            </label>
          </div>
          <label className="check-inline">
            <input type="checkbox" checked={publishOnUpload} onChange={(e) => setPublishOnUpload(e.target.checked)} />
            Publish immediately after upload
          </label>
          <div className="filters">
            <button className={`chip ${mediaState === 'all' ? 'on' : ''}`} onClick={() => setMediaState('all')}>All</button>
            <button className={`chip ${mediaState === 'published' ? 'on' : ''}`} onClick={() => setMediaState('published')}>Published</button>
            <button className={`chip ${mediaState === 'draft' ? 'on' : ''}`} onClick={() => setMediaState('draft')}>Draft</button>
            <button className={`chip ${mediaState === 'soft_deleted' ? 'on' : ''}`} onClick={() => setMediaState('soft_deleted')}>Soft deleted</button>
            <button className="btn small ghost" onClick={refreshMedia} disabled={mediaLoading}>{mediaLoading ? 'Refreshing…' : 'Refresh'}</button>
            <span className="hidedone">{media.length} item{media.length === 1 ? '' : 's'}</span>
          </div>
          {mediaMsg && <p className="muted small">{mediaMsg}</p>}
        </div>

        {media.length === 0 && !mediaLoading && (
          <p className="muted small">No media yet. Upload files above to start creating reusable public URLs.</p>
        )}

        {media.length > 0 && (
          <div className="cards two">
            {media.map((m) => (
              <div key={m.id} className="card">
                <div className="card-head">
                  <h3>{m.name}</h3>
                  <span className="tag" style={{ background: m.state === 'published' ? '#16a34a' : m.state === 'soft_deleted' ? '#ef4444' : '#6b7280', color: '#fff' }}>{m.state}</span>
                </div>
                <div className="kv"><span>Type</span><strong>{m.type || 'unknown'}</strong></div>
                <div className="kv"><span>Size</span><strong>{fmtBytes(m.size)}</strong></div>
                <div className="kv"><span>Created</span><strong>{m.createdAt ? fmt(m.createdAt.slice(0, 10)) : '—'}</strong></div>
                {m.publicUrl && (
                  <div className="cost-box">
                    <div className="small muted" style={{ marginBottom: 6 }}>Public URL</div>
                    <a href={m.publicUrl} target="_blank" rel="noreferrer" className="small">{m.publicUrl}</a>
                  </div>
                )}
                <div className="editor-actions">
                  {m.state !== 'published' && m.state !== 'soft_deleted' && (
                    <button className="btn small" onClick={() => actionMedia(m.id, 'publish')}>Publish</button>
                  )}
                  {m.state === 'published' && (
                    <button className="btn small ghost" onClick={() => actionMedia(m.id, 'unpublish')}>Unpublish</button>
                  )}
                  {m.state === 'soft_deleted' && (
                    <button className="btn small" onClick={() => actionMedia(m.id, 'restore')}>Restore</button>
                  )}
                  {m.publicUrl && (
                    <button className="btn small ghost" onClick={() => copyUrl(m.publicUrl)}>Copy URL</button>
                  )}
                  {m.state !== 'soft_deleted' && (
                    <button className="btn small danger" onClick={() => removeMedia(m.id)}>Soft delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>🐞 Bugs & feature requests</h3>
        <p className="muted small">Found something broken, or have an idea? Log it here. Items are saved in this browser and listed below — clear them once they’re handled.</p>
        <div className="card editor">
          <div className="filters">
            <button className={`chip ${fbType === 'bug' ? 'on' : ''}`} onClick={() => setFbType('bug')}>🐞 Bug</button>
            <button className={`chip ${fbType === 'feature' ? 'on' : ''}`} onClick={() => setFbType('feature')}>✨ Feature</button>
          </div>
          <div className="form-row">
            <label className="full">
              {fbType === 'bug' ? 'What’s the bug?' : 'What feature would you like?'}
              <textarea
                rows="3"
                value={fbText}
                onChange={(e) => setFbText(e.target.value)}
                placeholder={fbType === 'bug' ? 'Describe what went wrong and where…' : 'Describe the feature you’d like to see…'}
              />
            </label>
          </div>
          <div className="editor-actions">
            <button className="btn primary" onClick={submitFeedback} disabled={!fbText.trim()}>Submit</button>
          </div>
        </div>

        {feedback.length > 0 && (
          <>
            <div className="filters" style={{ marginTop: 12 }}>
              <span className="hidedone">{feedback.length} open</span>
              <button className="btn small ghost" onClick={clearFeedback}>Clear all</button>
            </div>
            <ul className="feedback-list">
              {feedback.map((f) => (
                <li key={f.id} className={`feedback-item ${f.type}`}>
                  <span className="feedback-tag">{f.type === 'bug' ? '🐞 Bug' : '✨ Feature'}</span>
                  <span className="feedback-text">{f.text}</span>
                  <span className="muted small feedback-when">{whenLabel(f.when)}</span>
                  <button className="btn small danger" onClick={() => removeFeedback(f.id)}>Clear</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rules">
        <h3>📝 Release notes</h3>
        <div className="timeline">
          {CHANGELOG.map((rel) => (
            <div key={rel.version} className="tl-item">
              <div className="tl-dot" style={{ background: '#7c3aed' }}>v</div>
              <div className="tl-body">
                <div className="tl-date">{fmt(rel.date)}</div>
                <div className="tl-title">Version {rel.version}</div>
                <ul className="resume-list">
                  {rel.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error || new Error('file read failed'));
    r.readAsDataURL(file);
  });
}

function fmtBytes(n) {
  const v = Number(n || 0);
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}
