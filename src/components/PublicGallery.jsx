import { useState, useEffect } from 'react';
import { GIFTING, STUDENT, ACHIEVEMENT_CATEGORIES, WRITING_CATEGORIES } from '../../shared/roadmap.js';

// ============================================================================
// Xanderr Art Gallery — the PUBLIC, pre-login landing page.
//
// Pulls only the sanitized, opt-in-published content from /api/public (no
// password). Shows three showcases: the art Gallery wall, the Achievement
// Trophy Box, and "The Ink & Page" writing. A compact 529 gift button and an
// optional Bio button live in the header, with a quiet Log in link that opens
// the existing password gate. Also injects schema.org JSON-LD + social meta so
// the page is discoverable by Google and clean for AI crawlers.
// ============================================================================

function setMeta(key, value, isProperty = false) {
  if (!value) return;
  const attr = isProperty ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export default function PublicGallery({ onUnlock }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);     // gallery image {image,title,medium}
  const [reading, setReading] = useState(null);       // writing piece being read in full
  const [showBio, setShowBio] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Login state (mirrors the old Login.jsx gate).
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const expected = import.meta.env.VITE_APP_PASSWORD || 'xandoesart';

  useEffect(() => {
    let alive = true;
    fetch('/api/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) { setData(d && d.ok ? d : emptyData()); setLoading(false); } })
      .catch(() => { if (alive) { setData(emptyData()); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  // SEO / AI: set social meta, canonical, and JSON-LD once data is in.
  useEffect(() => {
    if (!data) return;
    const origin = window.location.origin;
    document.title = `Xanderr — Art Gallery`;
    setMeta('description', data.bio
      ? data.bio.slice(0, 300)
      : 'The art and writing of Xanderr, a young artist building an art-school portfolio.');
    setMeta('og:title', 'Xanderr — Art Gallery', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', origin + '/', true);
    setMeta('og:description', data.bio
      ? data.bio.slice(0, 200)
      : 'Portfolio, achievements, and writing by Xanderr.', true);
    const ogImg = data.gallery && data.gallery[0] && data.gallery[0].image;
    if (ogImg) { setMeta('og:image', ogImg, true); setMeta('twitter:image', ogImg); }
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Xanderr — Art Gallery');

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = origin + '/';

    let s = document.getElementById('xanderr-jsonld');
    if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'xanderr-jsonld'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(data.jsonld || {});
  }, [data]);

  // Gentle fade-up as each artwork scrolls into view. Pure enhancement: if the
  // browser lacks IntersectionObserver we never hide anything (the 'reveal-on'
  // class — which applies the hidden start state — is only added when supported).
  useEffect(() => {
    if (!data || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const wrap = document.querySelector('.g-showcase');
    if (!wrap) return;
    wrap.classList.add('reveal-on');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    }, { threshold: 0.12 });
    wrap.querySelectorAll('.g-piece.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data]);

  function submitLogin(e) {
    e.preventDefault();
    if (pw === expected) {
      sessionStorage.setItem('viol_auth', '1');
      sessionStorage.setItem('viol_pw', pw);
      onUnlock();
    } else {
      setErr(true);
    }
  }

  const gallery = (data && data.gallery) || [];
  const trophies = (data && data.trophies) || [];
  const writing = (data && data.writing) || [];
  const bio = (data && data.bio) || '';
  const isEmpty = !loading && gallery.length === 0 && trophies.length === 0 && writing.length === 0;

  return (
    <div className="gallery-public" data-theme="light">
      <header className="g-top">
        <div className="g-brand">
          <span className="g-brand-emoji" aria-hidden>🎨</span>
          <div className="g-brand-text">
            <strong>{STUDENT.nickname}</strong>
            <span className="g-brand-sub">Art Gallery</span>
          </div>
        </div>
        <div className="g-top-actions">
          {bio && (
            <button className="btn ghost g-bio-btn" onClick={() => setShowBio(true)}>Bio</button>
          )}
          <a className="btn g-gift-btn" href={GIFTING.url} target="_blank" rel="noreferrer"
             title="Chip into my 529 — every bit helps me get to art school!">
            Send me to art school ♥
          </a>
          <button className="btn ghost g-login-link" onClick={() => setShowLogin(true)}>Log in</button>
        </div>
      </header>

      <section className="g-hero">
        <h1>The art of {STUDENT.nickname}</h1>
        <p className="g-hero-sub">A young artist&rsquo;s portfolio, achievements, and writing — all in one place.</p>
      </section>

      {loading && <p className="g-loading">Loading the gallery…</p>}

      {isEmpty && (
        <section className="g-section">
          <div className="g-empty">
            <div className="g-empty-emoji">🖼️</div>
            <h2>The gallery is being curated</h2>
            <p className="muted">New work is on the way — check back soon.</p>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="g-section g-section-wide">
          <h2 className="g-h">The Gallery</h2>
          <div className="g-showcase">
            {gallery.map((p, i) => (
              <article key={p.id} className="g-piece reveal">
                <button type="button" className="g-piece-img" onClick={() => setLightbox(p)} title="View larger">
                  <img src={p.image} alt={p.title || 'Artwork'} loading="lazy"
                       onError={(e) => { e.target.closest('.g-piece').style.display = 'none'; }} />
                </button>
                <div className="g-piece-info">
                  <span className="g-piece-no" aria-hidden>
                    <em>{String(i + 1).padStart(2, '0')}</em>
                    <span className="g-piece-rule" />
                    <i>{String(gallery.length).padStart(2, '0')}</i>
                  </span>
                  {p.medium && <span className="g-piece-medium">{p.medium}</span>}
                  <h3>{p.title || 'Untitled'}</h3>
                  {p.caption && <p className="g-piece-cap">{p.caption}</p>}
                  <button className="g-link g-piece-view" onClick={() => setLightbox(p)}>View piece →</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {trophies.length > 0 && (
        <section className="g-section">
          <h2 className="g-h">Achievement Trophy Box</h2>
          <div className="g-trophies">
            {trophies.map((t) => {
              const c = ACHIEVEMENT_CATEGORIES[t.category] || { label: 'Honor', emoji: '🏆', color: '#f59e0b' };
              return (
                <article key={t.id} className="g-trophy">
                  <div className="g-trophy-badge" style={{ background: c.color }}>{c.emoji}</div>
                  <h3>{t.title}</h3>
                  <div className="g-trophy-meta">
                    {t.venue && <span>{t.venue}</span>}
                    {t.date && <span className="muted">{t.date}</span>}
                  </div>
                  {t.image && (
                    <button type="button" className="g-trophy-thumb" onClick={() => setLightbox({ image: t.image, title: t.title, medium: t.venue })}>
                      <img src={t.image} alt={t.title} loading="lazy"
                           onError={(e) => { e.target.closest('.g-trophy-thumb').style.display = 'none'; }} />
                    </button>
                  )}
                  {t.description && <p className="g-trophy-desc">{t.description}</p>}
                  {t.link && <a className="g-link" href={t.link} target="_blank" rel="noreferrer">Learn more ↗</a>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {writing.length > 0 && (
        <section className="g-section">
          <h2 className="g-h">The Ink &amp; Page</h2>
          <div className="g-inkpage">
            {writing.map((w) => {
              const c = WRITING_CATEGORIES[w.category] || { label: 'Writing', emoji: '✍️', color: '#6b7280' };
              return (
                <article key={w.id} className="g-ink">
                  <div className="g-ink-head">
                    <span className="g-ink-kind" style={{ color: c.color }}>{c.emoji} {c.label}</span>
                    {w.date && <span className="muted small">{w.date}</span>}
                  </div>
                  <h3>{w.favorite ? '⭐ ' : ''}{w.title}</h3>
                  <p className="g-ink-excerpt">{w.excerpt}</p>
                  {w.full && w.body && (
                    <button className="g-link" onClick={() => setReading(w)}>Read full piece →</button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <footer className="g-foot">
        <span className="muted small">{STUDENT.nickname}&rsquo;s Art Gallery</span>
        <a className="g-foot-gift" href={GIFTING.url} target="_blank" rel="noreferrer">Send me to art school ♥</a>
      </footer>

      {/* Lightbox for artwork */}
      {lightbox && (
        <div className="g-modal" onClick={() => setLightbox(null)}>
          <div className="g-lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="g-modal-x" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
            <img src={lightbox.image} alt={lightbox.title || 'Artwork'} />
            <div className="g-lightbox-cap">
              <strong>{lightbox.title || 'Untitled'}</strong>
              {lightbox.medium && <span className="muted"> · {lightbox.medium}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Full writing reader */}
      {reading && (
        <div className="g-modal" onClick={() => setReading(null)}>
          <div className="g-reader" onClick={(e) => e.stopPropagation()}>
            <button className="g-modal-x" onClick={() => setReading(null)} aria-label="Close">✕</button>
            <h3>{reading.title}</h3>
            <pre className="g-reader-body">{reading.body}</pre>
          </div>
        </div>
      )}

      {/* Bio */}
      {showBio && bio && (
        <div className="g-modal" onClick={() => setShowBio(false)}>
          <div className="g-reader" onClick={(e) => e.stopPropagation()}>
            <button className="g-modal-x" onClick={() => setShowBio(false)} aria-label="Close">✕</button>
            <h3>About {STUDENT.nickname}</h3>
            <p className="g-bio-text">{bio}</p>
          </div>
        </div>
      )}

      {/* Login gate */}
      {showLogin && (
        <div className="g-modal" onClick={() => setShowLogin(false)}>
          <form className="g-login" onClick={(e) => e.stopPropagation()} onSubmit={submitLogin}>
            <button type="button" className="g-modal-x" onClick={() => setShowLogin(false)} aria-label="Close">✕</button>
            <div className="login-emoji">🔑</div>
            <h3 style={{ margin: 0 }}>Welcome back</h3>
            <p className="muted">Sign in to manage the roadmap.</p>
            <input type="password" placeholder="Password" value={pw} autoFocus
                   onChange={(e) => { setPw(e.target.value); setErr(false); }} />
            {err && <div className="login-err">That&rsquo;s not it — try again.</div>}
            <button type="submit" className="btn primary">Let&rsquo;s go →</button>
            <p className="login-note">A friendly gate, not a vault — keep the link private.</p>
          </form>
        </div>
      )}
    </div>
  );
}

function emptyData() {
  return { ok: true, bio: '', gallery: [], trophies: [], writing: [], jsonld: {} };
}
