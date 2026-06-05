import { useState } from 'react';
import { EVENTS, CATEGORIES } from '../../shared/roadmap.js';
import { fmt, statusOf, daysUntil, useCustomItems, useVolunteer, volunteerToEvent } from '../lib/util.js';

export default function Timeline({ done, toggle }) {
  const [hideDone, setHideDone] = useState(false);
  const { items: custom } = useCustomItems();
  const { items: volunteer } = useVolunteer();

  const all = [...EVENTS, ...custom, ...volunteer.map(volunteerToEvent)];
  const sortKey = (e) => (e.date ? daysUntil(e.date) : 99999);

  let rows = [...all].sort((a, b) => sortKey(a) - sortKey(b));
  if (hideDone) rows = rows.filter((e) => !done[e.id]);

  const completed = all.filter((e) => done[e.id]).length;
  const pct = all.length ? Math.round((completed / all.length) * 100) : 0;

  return (
    <div className="screen">
      <h2>Roadmap</h2>
      <p className="muted">Your whole journey to {`Fall 2027`}, in order. Check things off as you go — the timeline updates live.</p>

      <div className="progress-hero">
        <div className="bar big"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <strong>{pct}% done</strong>
        {pct === 100 && <span className="celebrate">🎉 You did it ALL!</span>}
        <label className="hidedone">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide done
        </label>
      </div>

      <div className="timeline">
        {rows.map((e) => {
          const st = e.date ? statusOf(e.date, done[e.id]) : (done[e.id] ? 'done' : 'soon');
          const c = CATEGORIES[e.category] || { label: 'Item', emoji: '•', color: '#6b7280' };
          return (
            <div key={e.id} className={`tl-item ${st}`}>
              <div className="tl-dot" style={{ background: done[e.id] ? '#22c55e' : c.color }}>
                {done[e.id] ? '✓' : c.emoji}
              </div>
              <div className="tl-body">
                <div className="tl-date">{e.date ? fmt(e.date) : 'No date'}</div>
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
