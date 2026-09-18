import { useMemo, useState } from 'react';
import { useStored } from '../lib/util.js';

export const PUBLIC_GALLERIES = [
  { id: 'oeuvre', label: 'Oeuvre' },
  { id: 'illustrations', label: 'Illustrations' },
  { id: 'ceramics', label: 'Ceramics' },
  { id: 'paintings', label: 'Paintings' },
];

const SIZES = [
  { id: 'standard', label: 'Standard' },
  { id: 'wide', label: 'Wide' },
  { id: 'tall', label: 'Tall' },
  { id: 'feature', label: 'Feature' },
];

function belongs(piece, gallery) {
  const hasCeramicViews = ['sideA', 'front', 'sideB', 'back'].every((key) => piece.ceramicViews?.[key]);
  if (!piece.public || (!piece.image && !piece.video && !hasCeramicViews)) return false;
  return gallery === 'oeuvre' ? !piece.hideFromOeuvre : (piece.publicCategories || []).includes(gallery);
}

export default function GalleryArranger({ pieces }) {
  const [layouts, setLayouts] = useStored('viol_gallery_layouts', {});
  const [gallery, setGallery] = useState('oeuvre');
  const [dragId, setDragId] = useState(null);
  const available = useMemo(() => pieces.filter((p) => belongs(p, gallery)), [pieces, gallery]);
  const saved = layouts[gallery] || { order: [], sizes: {} };
  const ordered = [
    ...saved.order.map((id) => available.find((p) => p.id === id)).filter(Boolean),
    ...available.filter((p) => !saved.order.includes(p.id)),
  ];

  function update(next) {
    setLayouts((all) => ({ ...all, [gallery]: next }));
  }

  function moveBefore(targetId) {
    if (!dragId || dragId === targetId) return;
    const order = ordered.map((p) => p.id).filter((id) => id !== dragId);
    order.splice(order.indexOf(targetId), 0, dragId);
    update({ ...saved, order });
    setDragId(null);
  }

  function setSize(id, size) {
    update({ ...saved, order: ordered.map((p) => p.id), sizes: { ...saved.sizes, [id]: size } });
  }

  return (
    <section className="card gallery-arranger">
      <div className="card-head">
        <div>
          <h3>Public gallery arrangement</h3>
          <p className="muted small">Drag pieces into order, then choose how much wall space each one gets. Every gallery keeps its own arrangement.</p>
        </div>
      </div>
      <div className="arranger-tabs" role="tablist" aria-label="Gallery to arrange">
        {PUBLIC_GALLERIES.map((g) => (
          <button type="button" key={g.id} className={`chip ${gallery === g.id ? 'on' : ''}`} aria-pressed={gallery === g.id} onClick={() => setGallery(g.id)}>{g.label}</button>
        ))}
      </div>
      {ordered.length === 0 ? (
        <p className="muted small">No published pieces are tagged for this gallery yet.</p>
      ) : (
        <div className="arranger-list">
          {ordered.map((piece, index) => (
            <article
              key={piece.id}
              className={`arranger-item ${dragId === piece.id ? 'dragging' : ''}`}
              draggable
              onDragStart={() => setDragId(piece.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveBefore(piece.id)}
            >
              <span className="arranger-grip" aria-hidden>⠿</span>
              {(piece.image || piece.ceramicViews?.front) ? <img src={piece.image || piece.ceramicViews.front} alt="" /> : <span className="arranger-video">▶</span>}
              <div className="arranger-name"><span>{String(index + 1).padStart(2, '0')}</span><strong>{piece.title || 'Untitled'}</strong></div>
              {gallery !== 'ceramics' && <div className="arranger-sizes" aria-label={`Size for ${piece.title || 'Untitled'}`}>
                {SIZES.map((size) => <button type="button" key={size.id} className={(saved.sizes[piece.id] || 'standard') === size.id ? 'active' : ''} onClick={() => setSize(piece.id, size.id)}>{size.label}</button>)}
              </div>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
