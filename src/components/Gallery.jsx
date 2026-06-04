import { useState } from 'react';
import { PORTFOLIO } from '../../shared/roadmap.js';
import { useStored } from '../lib/util.js';

export default function Gallery() {
  const [pieces] = useStored('viol_portfolio', []);
  const [only, setOnly] = useState('final');
  const [lightbox, setLightbox] = useState(null);

  const shown = pieces.filter((p) => (only === 'all' ? true : p.status === only));
  const withImg = shown.filter((p) => p.image);

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
        <p className="empty">You have {shown.length} piece{shown.length > 1 ? 's' : ''} here, but none have an image yet. Add an image URL in the Portfolio tab to see them on the wall.</p>
      )}

      <div className="gallery-wall">
        {shown.map((p) => (
          <figure key={p.id} className="art-frame" onClick={() => p.image && setLightbox(p)}>
            {p.image
              ? <img src={p.image} alt={p.title} onError={(e) => { e.target.closest('.art-frame').classList.add('noimg'); }} />
              : <div className="art-placeholder">🖼️</div>}
            <figcaption>
              <strong>{p.title}</strong>
              {p.medium && <span className="muted small"> · {p.medium}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      {lightbox && (
        <div className="modal-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.image} alt={lightbox.title} />
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
