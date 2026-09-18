import { useState } from 'react';
import { PORTFOLIO } from '../../shared/roadmap.js';
import { useStored, youtubeEmbedUrl, youtubeThumbUrl } from '../lib/util.js';

function slidesFor(p) {
  if (!p) return [];
  const slides = [];
  if (p.video) slides.push({ type: 'video', video: p.video });
  for (const image of [p.image, ...(p.images || [])]) {
    if (image) slides.push({ type: 'image', image });
  }
  return slides;
}

export default function Gallery() {
  const [pieces] = useStored('viol_portfolio', []);
  const [only, setOnly] = useState('final');
  const [lightbox, setLightbox] = useState(null);
  const [index, setIndex] = useState(0);

  const shown = pieces.filter((p) => (only === 'all' ? true : p.status === only));
  const withImg = shown.filter((p) => p.image || p.video);

  function openLightbox(p) {
    setLightbox(p);
    setIndex(0);
  }

  const slides = slidesFor(lightbox);
  const slide = slides[index];

  return (
    <div className="screen">
      <h2>Gallery — Your SlideRoom</h2>
      <p className="muted">{PORTFOLIO.slideroom.note}</p>

      <div className="filters">
        <button className={`chip ${only === 'final' ? 'on' : ''}`} onClick={() => setOnly('final')}>✅ Finals only</button>
        <button className={`chip ${only === 'all' ? 'on' : ''}`} onClick={() => setOnly('all')}>All pieces</button>
        <a className="btn primary" href={PORTFOLIO.slideroom.link} target="_blank" rel="noreferrer">Open SlideRoom ↗</a>
      </div>

      {shown.length === 0 && (
        <p className="empty">No {only === 'final' ? 'final' : ''} pieces to show yet. Mark pieces “Final” in the Portfolio tab — and add an image URL — to build your wall here.</p>
      )}
      {shown.length > 0 && withImg.length === 0 && (
        <p className="empty">You have {shown.length} piece{shown.length > 1 ? 's' : ''} here, but none have an image or video yet. Add one in the Portfolio tab to see them on the wall.</p>
      )}

      <div className="gallery-wall">
        {shown.map((p) => {
          const cover = p.image || (p.video && youtubeThumbUrl(p.video));
          return (
            <figure key={p.id} className={`art-frame ${p.video && !p.image ? 'has-video' : ''}`} onClick={() => (p.image || p.video) && openLightbox(p)}>
              {cover
                ? <img src={cover} alt={p.title} onError={(e) => { e.target.closest('.art-frame').classList.add('noimg'); }} />
                : <div className="art-placeholder">🖼️</div>}
              {p.video && <span className="play-badge" aria-hidden>▶</span>}
              <figcaption>
                <strong>{p.title}</strong>
                {p.medium && <span className="muted small"> · {p.medium}</span>}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {lightbox && slide && (
        <div className="modal-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setLightbox(null)}>✕</button>
            {slide.type === 'video'
              ? (youtubeEmbedUrl(slide.video)
                  ? <div className="video-embed"><iframe src={youtubeEmbedUrl(slide.video)} title={lightbox.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
                  : <p className="muted small">Video link didn&rsquo;t look like a YouTube URL.</p>)
              : <img src={slide.image} alt={lightbox.title} />}
            {slides.length > 1 && (
              <div className="lightbox-stepper">
                <button type="button" className="btn small ghost" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}>‹ Prev</button>
                <span className="muted small">{index + 1} / {slides.length}</span>
                <button type="button" className="btn small ghost" onClick={() => setIndex((i) => (i + 1) % slides.length)}>Next ›</button>
              </div>
            )}
            <div className="lightbox-meta">
              <strong>{lightbox.title}</strong>
              {lightbox.medium && <span className="muted"> · {lightbox.medium}</span>}
              {lightbox.notes && <p>{lightbox.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
