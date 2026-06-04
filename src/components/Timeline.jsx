import { EVENTS, CATEGORIES } from '../../shared/roadmap.js';
import { fmt, statusOf, daysUntil } from '../lib/util.js';

export default function Timeline({ done, toggle }) {
  const sorted = [...EVENTS].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  return (
    <div className="screen">
      <h2>Roadmap</h2>
      <p className="muted">Your whole journey to {`Fall 2027`}, in order. Check things off as you go — the timeline updates live.</p>
      <div className="timeline">
        {sorted.map((e) => {
          const st = statusOf(e.date, done[e.id]);
          const c = CATEGORIES[e.category];
          return (
            <div key={e.id} className={`tl-item ${st}`}>
              <div className="tl-dot" style={{ background: done[e.id] ? '#22c55e' : c.color }}>
                {done[e.id] ? '✓' : c.emoji}
              </div>
              <div className="tl-body">
                <div className="tl-date">{fmt(e.date)}</div>
                <div className="tl-title">
                  <label className="cbx">
                    <input type="checkbox" checked={!!done[e.id]} onChange={() => toggle(e.id)} />
                    <span className={done[e.id] ? 'struck' : ''}>{e.title}</span>
                  </label>
                </div>
                <span className="pill" style={{ background: c.color }}>{c.label}</span>
                {st === 'overdue' && !done[e.id] && <span className="pill danger-pill">Overdue</span>}
                {st === 'urgent' && !done[e.id] && <span className="pill warn-pill">Due this week</span>}
                {e.detail && <p className="tl-detail">{e.detail}</p>}
                {e.link && <a className="extlink" href={e.link} target="_blank" rel="noreferrer">Open link ↗</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
