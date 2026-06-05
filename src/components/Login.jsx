import { useState } from 'react';
import { GIFTING } from '../../shared/roadmap.js';

export default function Login({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const expected = import.meta.env.VITE_APP_PASSWORD || 'xandoesart';

  function submit(e) {
    e.preventDefault();
    if (pw === expected) {
      sessionStorage.setItem('viol_auth', '1');
      onUnlock();
    } else {
      setErr(true);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-stack">
        <form className="login-card" onSubmit={submit}>
          <div className="login-emoji">🎨✨</div>
          <h1>Violet&rsquo;s Art School Roadmap</h1>
          <p className="muted">Your future, in your hands. Sign in to keep building it.</p>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            autoFocus
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
          />
          {err && <div className="login-err">That&rsquo;s not it — try again.</div>}
          <button type="submit">Let&rsquo;s go →</button>
          <p className="login-note">
            Note: this is a friendly gate, not a vault — keep the link private.
          </p>
        </form>

        <aside className="gift-splash">
          <div className="gift-emoji">🎁</div>
          <h2>{GIFTING.headline}</h2>
          <p>{GIFTING.blurb}</p>
          <ul className="gift-bullets">
            {GIFTING.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <a className="btn primary gift-cta" href={GIFTING.url} target="_blank" rel="noreferrer">
            {GIFTING.cta}
          </a>
          <p className="login-note">Gifts go to Violet&rsquo;s 529 college-savings account through Fidelity. No sign-in here required to give.</p>
        </aside>
      </div>
    </div>
  );
}
