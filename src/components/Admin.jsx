import { useState } from 'react';
import { APP_VERSION, CHANGELOG } from '../../shared/version.js';
import { fmt, useFeedback, useStored } from '../lib/util.js';

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

  const [bio, setBio] = useStored('viol_bio', { text: '', public: false });
  const [bioDraft, setBioDraft] = useState(bio.text || '');
  const [bioSaved, setBioSaved] = useState(false);

  function saveBio() {
    setBio({ ...bio, text: bioDraft });
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 1500);
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
        <h3>🎨 Public artist bio</h3>
        <p className="muted small">Write a short bio for Xanderr’s public Art Gallery. When you publish it, a <strong>Bio</strong> button appears on the public page; leave it unpublished (or empty) and the button stays hidden. No email or contact info is ever shown.</p>
        <div className="card editor">
          <div className="form-row">
            <label className="full">Bio
              <textarea
                rows="5"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Xanderr is a young artist working in charcoal, ink, and digital illustration, building a portfolio for art school…"
              />
            </label>
          </div>
          <label className="check-inline">
            <input type="checkbox" checked={!!bio.public} onChange={(e) => setBio({ ...bio, public: e.target.checked })} />
            Publish this bio on the public gallery
          </label>
          <div className="editor-actions">
            <button className="btn primary" onClick={saveBio}>Save bio</button>
            {bioSaved && <span className="celebrate">Saved ✓</span>}
          </div>
          {bio.public && bio.text && bio.text.trim()
            ? <p className="muted small">✅ The <strong>Bio</strong> button is live on the public gallery.</p>
            : bio.public
              ? <p className="muted small">Add some text and click <strong>Save bio</strong> — an empty bio keeps the button hidden.</p>
              : null}
        </div>
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
