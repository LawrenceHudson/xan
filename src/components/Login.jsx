import { useState } from 'react';

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
    </div>
  );
}
