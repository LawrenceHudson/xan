import { useState } from 'react';
import { EVENTS, CATEGORIES } from '../../shared/roadmap.js';
import { fmt, statusOf, daysUntil } from '../lib/util.js';

export default function Checklist({ done, toggle }) {
  const [filter, setFilter] = useState('all');
  const [hideDone, setHideDone] = useState(false);

  let rows = [...EVENTS].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  if (filter !== 'all') rows = rows.filter((e) => e.category === filter);
  if (hideDone) rows = rows.filter((e) => !done[e.id]);

  const completed = EVENTS.filter((e) => done[e.id]).length;
  const pct = Math.round((completed / EVENTS.length) * 100);

  return (
    <div className="screen">
      <h2>Checklist</h2>

      <div className="progress-hero">
        <div className="bar big"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <strong>{pct}% done</strong>
        {pct === 100 && <span className="celebrate">🎉 You did it ALL!</span>}
      </div>

      <div className="filters">
        <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All</button>
        {Object.entries(CATEGORIES).map(([k, c]) => (
          <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}
            style={filter === k ? { background: c.color, color: '#fff', borderColor: c.color } : {}}>
            {c.emoji} {c.label}
          </button>
        ))}
        <label className="hidedone">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide done
        </label>
      </div>

      <ul className="evlist">
        {rows.map((e) => {
          const st = statusOf(e.date, done[e.id]);
          const c = CATEGORIES[e.category];
          return (
            <li key={e.id} className={`evrow ${st}`}>
              <label className="cbx big-check">
                <input type="checkbox" checked={!!done[e.id]} onChange={() => toggle(e.id)} />
              </label>
              <div className="evmeta">
                <span className="pill" style={{ background: c.color }}>{c.emoji} {c.label}</span>
                <strong className={done[e.id] ? 'struck' : ''}>{e.title}</strong>
                <span className="muted small">
                  {fmt(e.date)}
                  {!done[e.id] && st === 'overdue' && ' · ⚠️ overdue'}
                  {!done[e.id] && st === 'urgent' && ' · ⏰ this week'}
                </span>
                {e.detail && <span className="detail">{e.detail}</span>}
                {e.link && <a className="extlink" href={e.link} target="_blank" rel="noreferrer">Open ↗</a>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
