import { useState } from 'react';
import { APP_VERSION, CHANGELOG } from '../../shared/version.js';
import { fmt } from '../lib/util.js';

export default function Admin() {
  const [status, setStatus] = useState(null); // null | 'sending' | {ok, msg}

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
