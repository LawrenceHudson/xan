import { useState } from 'react';
import { GIFTING, STUDENT } from '../../shared/roadmap.js';

export default function Login({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const expected = import.meta.env.VITE_APP_PASSWORD || 'xandoesart';

  function submit(e) {
    e.preventDefault();
    if (pw === expected) {
      sessionStorage.setItem('viol_auth', '1');
      // Stash the password so the sync layer can send it as the API token
      // (matched against APP_API_TOKEN on the server).
      sessionStorage.setItem('viol_pw', pw);
      onUnlock();
    } else {
      setErr(true);
    }
  }

  return (
    <div className="public-wrap">
      <header className="public-top">
        <div className="brand">
          <span className="brand-emoji">🎨</span>
          <strong>{STUDENT.name}&rsquo;s Art Journey</strong>
        </div>
        <button className="btn ghost login-link" onClick={() => setShowLogin((v) => !v)}>
          {showLogin ? 'Close' : 'Log in'}
        </button>
      </header>

      {showLogin && (
        <div className="login-pop" role="dialog" aria-label="Sign in">
          <form className="login-card" onSubmit={submit}>
            <div className="login-emoji">🔑</div>
            <h2 style={{ margin: 0 }}>Welcome back</h2>
            <p className="muted">Sign in to keep building the roadmap.</p>
            <input type="password" placeholder="Password" value={pw} autoFocus
              onChange={(e) => { setPw(e.target.value); setErr(false); }} />
            {err && <div className="login-err">That&rsquo;s not it — try again.</div>}
            <button type="submit">Let&rsquo;s go →</button>
            <button type="button" className="btn ghost" onClick={() => setShowLogin(false)}>Cancel</button>
            <p className="login-note">A friendly gate, not a vault — keep the link private.</p>
          </form>
        </div>
      )}

      <section className="hero">
        <div className="hero-emoji">🎨✨</div>
        <h1>Meet {STUDENT.name}</h1>
        <p className="hero-sub">
          aka <strong>{STUDENT.nickname}</strong> — a young artist building a portfolio, chasing
          scholarships, and headed for art school in {STUDENT.enrollTerm}.
        </p>
        <p className="hero-body">
          This is her home base: a place to track her art, her writing, the schools she dreams about,
          and every step between here and acceptance. The work is hers — and so is the future.
        </p>
      </section>

      <section className="gift-splash public-gift">
        <div className="gift-emoji">🎁</div>
        <h2>{GIFTING.headline}</h2>
        <p>{GIFTING.blurb}</p>
        <ul className="gift-bullets">{GIFTING.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        <a className="btn primary gift-cta" href={GIFTING.url} target="_blank" rel="noreferrer">{GIFTING.cta}</a>
        <p className="login-note">Gifts go to {STUDENT.name}&rsquo;s 529 college-savings account through Fidelity. No sign-in required to give.</p>
      </section>

      <footer className="public-foot">
        <span className="muted small">Family &amp; friends are always welcome here. ✨</span>
      </footer>
    </div>
  );
}
