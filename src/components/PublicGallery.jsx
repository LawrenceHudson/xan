import { useEffect, useMemo, useState } from 'react';
import { ACHIEVEMENT_CATEGORIES, GIFTING, STUDENT, WRITING_CATEGORIES } from '../../shared/roadmap.js';
import { youtubeEmbedUrl, youtubeThumbUrl } from '../lib/util.js';

const VIEWS = [
  { id: 'oeuvre', label: 'Oeuvre', path: '/oeuvre' },
  { id: 'illustrations', label: 'Illustrations', path: '/illustrations' },
  { id: 'ceramics', label: 'Ceramics', path: '/ceramics' },
  { id: 'paintings', label: 'Paintings', path: '/paintings' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

function viewFromPath(pathname) {
  const clean = String(pathname || '/').replace(/\/+$/, '') || '/';
  return VIEWS.find((view) => view.path === clean)?.id || 'home';
}

function emptyData() {
  return { ok: true, bio: '', gallery: [], layouts: {}, trophies: [], writing: [], jsonld: {} };
}

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

function slidesFor(piece) {
  return [piece?.image, ...(piece?.images || [])].filter(Boolean);
}

export default function PublicGallery({ onUnlock }) {
  const [data, setData] = useState(null);
  const [view, setView] = useState(() => viewFromPath(window.location.pathname));
  const [lightbox, setLightbox] = useState(null);
  const [slide, setSlide] = useState(0);
  const [reading, setReading] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/public?_=${Date.now()}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => { if (alive) setData(payload?.ok ? payload : emptyData()); })
      .catch(() => { if (alive) setData(emptyData()); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onPop = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!data) return;
    const title = view === 'home' ? 'Xanderr — Portfolio' : `${VIEWS.find((item) => item.id === view)?.label || 'Portfolio'} — Xanderr`;
    document.title = title;
    setMeta('description', data.bio ? data.bio.slice(0, 300) : 'The art, writing, and achievements of Xanderr.');
    setMeta('og:title', title, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', window.location.href, true);
    const firstImage = data.gallery?.find((piece) => piece.image)?.image;
    if (firstImage) setMeta('og:image', firstImage, true);
    const schema = document.getElementById('xanderr-jsonld');
    if (schema) schema.textContent = JSON.stringify(data.jsonld || {});
  }, [data, view]);

  function navigate(event, next) {
    event.preventDefault();
    const target = VIEWS.find((item) => item.id === next)?.path || '/';
    window.history.pushState({}, '', target);
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPiece(piece) {
    if (piece.video && !piece.image) return;
    setSlide(0);
    setLightbox(piece);
  }

  function submitLogin(event) {
    event.preventDefault();
    const expected = import.meta.env.VITE_APP_PASSWORD || 'xandoesart';
    if (password !== expected) {
      setLoginError(true);
      return;
    }
    sessionStorage.setItem('viol_auth', '1');
    sessionStorage.setItem('viol_pw', password);
    onUnlock();
  }

  const content = data || emptyData();
  return (
    <div className="xp-site">
      {view === 'home' && <div className="xp-banner" role="img" aria-label="Paintbrushes resting across drawings and paintings" />}
      <SiteHeader active={view} onNavigate={navigate} />
      <main id="main-content">
        {view === 'home' && <Home onLogin={() => setShowLogin(true)} />}
        {['oeuvre', 'illustrations', 'ceramics', 'paintings'].includes(view) && <GalleryView view={view} data={content} onOpen={openPiece} />}
        {view === 'about' && <About data={content} onRead={setReading} onOpen={openPiece} />}
        {view === 'contact' && <Contact />}
      </main>
      {view !== 'home' && <footer className="xp-footer"><span>© {new Date().getFullYear()} {STUDENT.nickname}</span><button type="button" className="xp-footer-key" onClick={() => setShowLogin(true)} aria-label="Artist login"><img src="/xanderr-skeleton.png" alt="" /></button></footer>}
      {lightbox && <ArtworkModal piece={lightbox} slide={slide} setSlide={setSlide} onClose={() => setLightbox(null)} />}
      {reading && <WritingModal piece={reading} onClose={() => setReading(null)} />}
      {showLogin && <div className="xp-modal" role="presentation" onMouseDown={() => setShowLogin(false)}><form className="xp-login" onMouseDown={(event) => event.stopPropagation()} onSubmit={submitLogin}><button type="button" className="xp-close" onClick={() => setShowLogin(false)} aria-label="Close">×</button><img src="/xanderr-skeleton.png" alt="" /><h2>Backstage</h2><label>Password<input type="password" value={password} autoFocus onChange={(event) => { setPassword(event.target.value); setLoginError(false); }} /></label>{loginError && <p className="xp-form-error">That password didn’t work.</p>}<button type="submit" className="xp-submit">Enter</button></form></div>}
    </div>
  );
}

function SiteHeader({ active, onNavigate }) {
  return <header className="xp-header"><a href="/" className="xp-logo" onClick={(event) => onNavigate(event, 'home')} aria-label="Xanderr portfolio home"><img src="/xanderr-logo.png" alt="Xanderr Portfolio" /></a><nav className="xp-nav" aria-label="Portfolio">{VIEWS.map((view) => <a key={view.id} href={view.path} className={active === view.id ? 'active' : ''} onClick={(event) => onNavigate(event, view.id)}>{view.label}</a>)}</nav></header>;
}

function Home({ onLogin }) {
  return <section className="xp-home" aria-label="Xanderr portfolio entrance"><button type="button" className="xp-skeleton-key" onClick={onLogin} aria-label="Artist login"><img src="/xanderr-skeleton.png" alt="Colorful illustrated skeleton" /></button></section>;
}

function GalleryView({ view, data, onOpen }) {
  const pieces = useMemo(() => {
    const matches = data.gallery.filter((piece) => view === 'oeuvre' || (piece.publicCategories || []).includes(view));
    const order = data.layouts?.[view]?.order || [];
    return [...order.map((id) => matches.find((piece) => piece.id === id)).filter(Boolean), ...matches.filter((piece) => !order.includes(piece.id))];
  }, [data, view]);
  const sizes = data.layouts?.[view]?.sizes || {};
  const title = VIEWS.find((item) => item.id === view)?.label;
  return <section className="xp-page xp-gallery-page"><div className="xp-page-title"><span>Selected works</span><h1>{title}</h1></div>{pieces.length === 0 ? <div className="xp-empty"><p>This wall is being curated.</p><span>Check back for new work.</span></div> : <div className="xp-salon">{pieces.map((piece, index) => { const cover = piece.image || youtubeThumbUrl(piece.video); const size = sizes[piece.id] || ['feature', 'standard', 'tall', 'wide', 'standard'][index % 5]; const embed = youtubeEmbedUrl(piece.video); return <article key={piece.id} className={`xp-work xp-${size}`}><button type="button" className="xp-art" onClick={() => embed && !piece.image ? null : onOpen(piece)} aria-label={`View ${piece.title || 'artwork'}`}>{cover && <img src={cover} alt={piece.title || 'Untitled artwork'} loading="lazy" />}{embed && <span className="xp-play" aria-hidden>▶</span>}</button><div className="xp-caption"><h2>{piece.title || 'Untitled'}</h2>{piece.medium && <p>{piece.medium}</p>}{piece.caption && <p className="xp-caption-note">{piece.caption}</p>}</div>{embed && <a className="xp-video-link" href={piece.video} target="_blank" rel="noreferrer">Watch video ↗</a>}</article>; })}</div>}</section>;
}

function About({ data, onRead, onOpen }) {
  return <section className="xp-page xp-about"><div className="xp-page-title"><span>Artist &amp; work</span><h1>About</h1></div><article className="xp-bio"><p className="xp-kicker">Artist bio</p><h2>{STUDENT.nickname}</h2><p>{data.bio || 'Artist bio coming soon.'}</p></article><details className="xp-support"><summary>Send me to art school <span>+</span></summary><div><h2>{GIFTING.headline}</h2><p>{GIFTING.blurb}</p><ul>{GIFTING.bullets.map((item) => <li key={item}>{item}</li>)}</ul><a href={GIFTING.url} target="_blank" rel="noreferrer">{GIFTING.cta}</a></div></details><div className="xp-about-grid"><section><p className="xp-kicker">Recognition</p><h2>Achievements</h2><div className="xp-achievements">{data.trophies.length ? data.trophies.map((item) => { const category = ACHIEVEMENT_CATEGORIES[item.category] || {}; return <article key={item.id}><span>{category.label || 'Achievement'}{item.date ? ` · ${item.date}` : ''}</span><h3>{item.title}</h3>{item.venue && <p>{item.venue}</p>}{item.description && <p>{item.description}</p>}{item.image && <button onClick={() => onOpen({ image: item.image, title: item.title, medium: item.venue })}>View image</button>}</article>; }) : <p className="xp-muted">Achievements will appear here when published.</p>}</div></section><section><p className="xp-kicker">Words</p><h2>Writing</h2><div className="xp-writing">{data.writing.length ? data.writing.map((item) => { const category = WRITING_CATEGORIES[item.category] || {}; return <article key={item.id}><span>{category.label || 'Writing'}{item.date ? ` · ${item.date}` : ''}</span><h3>{item.title}</h3><p>{item.excerpt}</p>{item.full && item.body && <button onClick={() => onRead(item)}>Read piece</button>}</article>; }) : <p className="xp-muted">Writing will appear here when published.</p>}</div></section></div></section>;
}

function Contact() {
  const [form, setForm] = useState({ firstName: '', replyEmail: '', message: '', website: '' });
  const [state, setState] = useState('idle');
  async function submit(event) { event.preventDefault(); setState('sending'); try { const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!response.ok) throw new Error('send failed'); setState('sent'); setForm({ firstName: '', replyEmail: '', message: '', website: '' }); } catch { setState('error'); } }
  return <section className="xp-page xp-contact"><div className="xp-page-title"><span>Say hello</span><h1>Contact</h1></div><div className="xp-contact-grid"><div><h2>Let’s talk.</h2><p>Questions about a piece, an exhibition, or a creative collaboration? Send a note.</p></div><form onSubmit={submit}><label>First name<input required autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label>Reply email<input required type="email" autoComplete="email" value={form.replyEmail} onChange={(event) => setForm({ ...form, replyEmail: event.target.value })} /></label><label>Note<textarea required rows="8" maxLength="5000" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label><label className="xp-honeypot" aria-hidden>Website<input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label><button className="xp-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send note'}</button>{state === 'sent' && <p className="xp-form-success">Thanks — your note is on its way.</p>}{state === 'error' && <p className="xp-form-error">That didn’t send. Please try again in a moment.</p>}</form></div></section>;
}

function ArtworkModal({ piece, slide, setSlide, onClose }) {
  const slides = slidesFor(piece);
  return <div className="xp-modal" onMouseDown={onClose}><div className="xp-lightbox" onMouseDown={(event) => event.stopPropagation()}><button className="xp-close" onClick={onClose} aria-label="Close">×</button><img src={slides[slide] || piece.image} alt={piece.title || 'Artwork'} />{slides.length > 1 && <div className="xp-stepper"><button onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}>←</button><span>{slide + 1} / {slides.length}</span><button onClick={() => setSlide((slide + 1) % slides.length)}>→</button></div>}<h2>{piece.title || 'Untitled'}</h2>{piece.medium && <p>{piece.medium}</p>}</div></div>;
}

function WritingModal({ piece, onClose }) {
  return <div className="xp-modal" onMouseDown={onClose}><article className="xp-reader" onMouseDown={(event) => event.stopPropagation()}><button className="xp-close" onClick={onClose} aria-label="Close">×</button><p className="xp-kicker">Writing</p><h2>{piece.title}</h2><div>{piece.body}</div></article></div>;
}
