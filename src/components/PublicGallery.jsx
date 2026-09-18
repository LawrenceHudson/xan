import { useEffect, useMemo, useState } from 'react';
import { ACHIEVEMENT_CATEGORIES, GIFTING, WRITING_CATEGORIES } from '../../shared/roadmap.js';
import { DEFAULT_ABOUT } from '../../shared/about.js';
import { youtubeThumbUrl } from '../lib/util.js';

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
  return { ok: true, about: DEFAULT_ABOUT, gallery: [], layouts: {}, trophies: [], writing: [], jsonld: {} };
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

function formatCreated(value) {
  if (!value) return '';
  try { return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }); } catch { return value; }
}

function ceramicImages(piece) {
  const views = piece.ceramicViews || {};
  return [
    { key: 'sideA', label: 'Side', src: views.sideA },
    { key: 'front', label: 'Front', src: views.front },
    { key: 'sideB', label: 'Side', src: views.sideB },
    { key: 'back', label: 'Back', src: views.back },
  ];
}

function ceramicComplete(piece) {
  return ceramicImages(piece).every((view) => view.src);
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
    const viewName = VIEWS.find((item) => item.id === view)?.label;
    const title = view === 'home' ? 'XANDERR — Portfolio' : `${viewName || 'Portfolio'} — XANDERR`;
    const description = data.about?.bio?.slice(0, 300) || 'The art, writing, and achievements of XANDERR.';
    const preview = new URL('/og.png', window.location.origin).href;
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description.slice(0, 200), true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', window.location.href, true);
    setMeta('og:image', preview, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description.slice(0, 200));
    setMeta('twitter:image', preview);
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

  function openPiece(piece, firstImage) {
    const available = ceramicComplete(piece) ? ceramicImages(piece).map((view) => view.src) : slidesFor(piece);
    const images = firstImage ? [firstImage, ...available.filter((src) => src !== firstImage)] : available;
    setSlide(0);
    setLightbox({ ...piece, image: images[0], images: images.slice(1) });
  }

  function submitLogin(event) {
    event.preventDefault();
    const expected = import.meta.env.VITE_APP_PASSWORD || 'xandoesart';
    if (password !== expected) return setLoginError(true);
    sessionStorage.setItem('viol_auth', '1');
    sessionStorage.setItem('viol_pw', password);
    onUnlock();
  }

  const content = data || emptyData();
  const onHome = (event) => navigate(event, 'home');
  return (
    <div className="xp-site">
      {view === 'home' && <div className="xp-banner" role="img" aria-label="Paintbrushes resting across drawings and paintings" />}
      <SiteHeader active={view} onNavigate={navigate} />
      <main id="main-content">
        {view === 'home' && <Home onLogin={() => setShowLogin(true)} />}
        {['oeuvre', 'illustrations', 'ceramics', 'paintings'].includes(view) && <GalleryView view={view} data={content} onOpen={openPiece} onHome={onHome} />}
        {view === 'about' && <About data={content} onRead={setReading} onOpen={openPiece} onHome={onHome} />}
        {view === 'contact' && <Contact onHome={onHome} />}
      </main>
      {view !== 'home' && <footer className="xp-footer"><span>© {new Date().getFullYear()} XANDERR</span><button type="button" className="xp-footer-key" onClick={() => setShowLogin(true)} aria-label="Artist login"><img src="/xanderr-skeleton.png" alt="" /></button></footer>}
      {lightbox && <ArtworkModal piece={lightbox} slide={slide} setSlide={setSlide} onClose={() => setLightbox(null)} />}
      {reading && <WritingModal piece={reading} onClose={() => setReading(null)} />}
      {showLogin && <div className="xp-modal" role="presentation" onMouseDown={() => setShowLogin(false)}><form className="xp-login" onMouseDown={(event) => event.stopPropagation()} onSubmit={submitLogin}><button type="button" className="xp-close" onClick={() => setShowLogin(false)} aria-label="Close">×</button><img src="/xanderr-skeleton.png" alt="" /><h2>Backstage</h2><label>Password<input type="password" value={password} autoFocus onChange={(event) => { setPassword(event.target.value); setLoginError(false); }} /></label>{loginError && <p className="xp-form-error">That password didn’t work.</p>}<button type="submit" className="xp-submit">Enter</button></form></div>}
    </div>
  );
}

function SiteHeader({ active, onNavigate }) {
  return <header className="xp-header"><a href="/" className="xp-logo" onClick={(event) => onNavigate(event, 'home')} aria-label="XANDERR portfolio home"><img src="/xanderr-logo.png" alt="XANDERR Portfolio" /></a><nav className="xp-nav" aria-label="Portfolio">{VIEWS.map((view) => <a key={view.id} href={view.path} className={active === view.id ? 'active' : ''} onClick={(event) => onNavigate(event, view.id)}>{view.label}</a>)}</nav></header>;
}

function Home({ onLogin }) {
  return <section className="xp-home" aria-label="XANDERR portfolio entrance"><button type="button" className="xp-skeleton-key" onClick={onLogin} aria-label="Artist login"><img src="/xanderr-skeleton.png" alt="Colorful illustrated skeleton" /></button></section>;
}

function PageTitle({ children, onHome, eyebrow = 'Selected works' }) {
  const label = children === 'About' ? 'Artist & work' : children === 'Contact' ? 'Say hello' : eyebrow;
  return <div className="xp-page-title"><span>{label}</span><h1><a href="/" onClick={onHome}>{children}</a></h1></div>;
}

function PieceMeta({ piece }) {
  return <div className="xp-piece-meta"><h2>{piece.title || 'Untitled'}</h2>{piece.created && <p>{formatCreated(piece.created)}</p>}{piece.medium && <p>{piece.medium}</p>}{piece.caption && <p className="xp-piece-bio">{piece.caption}</p>}</div>;
}

function GalleryView({ view, data, onOpen, onHome }) {
  const pieces = useMemo(() => {
    const matches = data.gallery.filter((piece) => {
      if (view === 'oeuvre') return !piece.hideFromOeuvre;
      if (!(piece.publicCategories || []).includes(view)) return false;
      return view !== 'ceramics' || ceramicComplete(piece);
    });
    const order = data.layouts?.[view]?.order || [];
    return [...order.map((id) => matches.find((piece) => piece.id === id)).filter(Boolean), ...matches.filter((piece) => !order.includes(piece.id))];
  }, [data, view]);
  const sizes = data.layouts?.[view]?.sizes || {};
  const title = VIEWS.find((item) => item.id === view)?.label;

  if (view === 'ceramics') {
    return <section className="xp-page xp-gallery-page"><PageTitle onHome={onHome}>{title}</PageTitle>{pieces.length === 0 ? <EmptyWall /> : <div className="xp-ceramic-list">{pieces.map((piece) => <article className="xp-ceramic-piece" key={piece.id}><PieceMeta piece={piece} /><div className="xp-ceramic-row">{ceramicImages(piece).map((item) => <button type="button" key={item.key} onClick={() => onOpen(piece, item.src)}><img src={item.src} alt={`${piece.title || 'Ceramic'} — ${item.label}`} loading="lazy" /><span>{item.label}</span></button>)}</div></article>)}</div>}</section>;
  }

  return <section className="xp-page xp-gallery-page"><PageTitle onHome={onHome}>{title}</PageTitle>{pieces.length === 0 ? <EmptyWall /> : <div className="xp-salon">{pieces.map((piece, index) => { const size = sizes[piece.id] || ['feature', 'standard', 'tall', 'wide', 'standard'][index % 5]; const cover = piece.image || piece.ceramicViews?.front; const thumb = cover || youtubeThumbUrl(piece.video); return <article key={piece.id} className={`xp-work xp-${size} ${piece.video ? 'xp-video-work' : ''}`}>{piece.video ? <a className="xp-art xp-video-poster" href={piece.video} target="_blank" rel="noreferrer" style={thumb ? { backgroundImage: `url("${thumb}")` } : undefined} aria-label={`Open ${piece.title || 'video'}`}><span className="xp-video-play" aria-hidden>▶</span><PieceMeta piece={piece} /></a> : <button type="button" className="xp-art" onClick={() => onOpen(piece, cover)} aria-label={`View ${piece.title || 'artwork'}`}><img src={cover} alt={piece.title || 'Untitled artwork'} loading="lazy" /><PieceMeta piece={piece} /></button>}</article>; })}</div>}</section>;
}

function EmptyWall() {
  return <div className="xp-empty"><p>This wall is being curated.</p><span>Check back for new work.</span></div>;
}

function About({ data, onRead, onOpen, onHome }) {
  const about = data.about || DEFAULT_ABOUT;
  return <section className="xp-page xp-about"><PageTitle onHome={onHome}>About</PageTitle><article className="xp-bio"><p className="xp-kicker">Artist bio</p><h2>Xander Hudson</h2><div className="xp-prose">{about.bio || 'Artist bio coming soon.'}</div></article><article className="xp-statement"><p className="xp-kicker">Artist statement</p><h2>Statement</h2><div className="xp-prose">{about.statement || 'Artist statement coming soon.'}</div></article>{about.cv?.length > 0 && <section className="xp-cv"><p className="xp-kicker">Selected experience</p><h2>Artist CV</h2><div>{about.cv.map((item) => <article key={item.id}><time>{item.year}</time><div><h3>{item.title}</h3>{item.organization && <p>{item.organization}</p>}{item.details && <p>{item.details}</p>}{item.link && <a href={item.link} target="_blank" rel="noreferrer">View ↗</a>}</div></article>)}</div></section>}<details className="xp-support"><summary>Send me to art school <span>+</span></summary><div><h2>{GIFTING.headline}</h2><p>{GIFTING.blurb}</p><ul>{GIFTING.bullets.map((item) => <li key={item}>{item}</li>)}</ul><a href={GIFTING.url} target="_blank" rel="noreferrer">{GIFTING.cta}</a></div></details><div className="xp-about-grid"><section><p className="xp-kicker">Recognition</p><h2>Achievements</h2><div className="xp-achievements">{data.trophies.length ? data.trophies.map((item) => { const category = ACHIEVEMENT_CATEGORIES[item.category] || {}; return <article key={item.id}><span>{category.label || 'Achievement'}{item.date ? ` · ${item.date}` : ''}</span><h3>{item.title}</h3>{item.venue && <p>{item.venue}</p>}{item.description && <p>{item.description}</p>}{item.image && <button onClick={() => onOpen({ image: item.image, title: item.title, medium: item.venue })}>View image</button>}</article>; }) : <p className="xp-muted">Achievements will appear here when published.</p>}</div></section><section><p className="xp-kicker">Words</p><h2>Writing</h2><div className="xp-writing">{data.writing.length ? data.writing.map((item) => { const category = WRITING_CATEGORIES[item.category] || {}; return <article key={item.id}><span>{category.label || 'Writing'}{item.date ? ` · ${item.date}` : ''}</span><h3>{item.title}</h3><p>{item.excerpt}</p>{item.full && item.body && <button onClick={() => onRead(item)}>Read piece</button>}</article>; }) : <p className="xp-muted">Writing will appear here when published.</p>}</div></section></div></section>;
}

function Contact({ onHome }) {
  const [form, setForm] = useState({ firstName: '', replyEmail: '', message: '', website: '' });
  const [state, setState] = useState('idle');
  async function submit(event) { event.preventDefault(); setState('sending'); try { const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!response.ok) throw new Error('send failed'); setState('sent'); setForm({ firstName: '', replyEmail: '', message: '', website: '' }); } catch { setState('error'); } }
  return <section className="xp-page xp-contact"><PageTitle onHome={onHome}>Contact</PageTitle><div className="xp-contact-grid"><div><h2>Let’s talk.</h2><p>Questions about a piece, an exhibition, or a creative collaboration? Send a note.</p></div><form onSubmit={submit}><label>First name<input required autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label>Reply email<input required type="email" autoComplete="email" value={form.replyEmail} onChange={(event) => setForm({ ...form, replyEmail: event.target.value })} /></label><label>Note<textarea required rows="8" maxLength="5000" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label><label className="xp-honeypot" aria-hidden>Website<input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label><button className="xp-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send note'}</button>{state === 'sent' && <p className="xp-form-success">Thanks — your note is on its way.</p>}{state === 'error' && <p className="xp-form-error">That didn’t send. Please try again in a moment.</p>}</form></div></section>;
}

function ArtworkModal({ piece, slide, setSlide, onClose }) {
  const slides = slidesFor(piece);
  return <div className="xp-modal" onMouseDown={onClose}><div className="xp-lightbox" onMouseDown={(event) => event.stopPropagation()}><button className="xp-close" onClick={onClose} aria-label="Close">×</button><img src={slides[slide] || piece.image} alt={piece.title || 'Artwork'} />{slides.length > 1 && <div className="xp-stepper"><button onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}>←</button><span>{slide + 1} / {slides.length}</span><button onClick={() => setSlide((slide + 1) % slides.length)}>→</button></div>}<h2>{piece.title || 'Untitled'}</h2>{piece.created && <p>{formatCreated(piece.created)}</p>}{piece.medium && <p>{piece.medium}</p>}{piece.caption && <p>{piece.caption}</p>}</div></div>;
}

function WritingModal({ piece, onClose }) {
  return <div className="xp-modal" onMouseDown={onClose}><article className="xp-reader" onMouseDown={(event) => event.stopPropagation()}><button className="xp-close" onClick={onClose} aria-label="Close">×</button><p className="xp-kicker">Writing</p><h2>{piece.title}</h2><div>{piece.body}</div></article></div>;
}
