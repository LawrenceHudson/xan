import { useState } from 'react';
import { EVENTS, CATEGORIES } from '../../shared/roadmap.js';
import { parseDate, fmt, statusOf } from '../lib/util.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function CalendarView({ done, toggle }) {
  const first = EVENTS.map((e) => parseDate(e.date)).sort((a, b) => a - b)[0] || new Date();
  const [cursor, setCursor] = useState(new Date(first.getFullYear(), first.getMonth(), 1));
  const [picked, setPicked] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = {};
  for (const e of EVENTS) {
    const d = parseDate(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      (byDay[d.getDate()] ||= []).push(e);
    }
  }

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="screen">
      <h2>Calendar</h2>
      <p className="muted">🔔 Every event auto-emails a reminder <strong>1 week before</strong> (and again 1 day before for deadlines).</p>

      <div className="cal-nav">
        <button className="ghost" onClick={() => setCursor(new Date(year, month - 1, 1))}>← Prev</button>
        <strong>{MONTHS[month]} {year}</strong>
        <button className="ghost" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next →</button>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`cal-cell ${d ? '' : 'empty'}`}>
            {d && <div className="cal-day">{d}</div>}
            {d && (byDay[d] || []).map((e) => (
              <button
                key={e.id}
                className={`cal-ev ${statusOf(e.date, done[e.id])}`}
                style={{ borderLeftColor: CATEGORIES[e.category].color }}
                onClick={() => setPicked(e)}
                title={e.title}
              >
                {CATEGORIES[e.category].emoji} {e.title}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="legend">
        {Object.entries(CATEGORIES).map(([k, c]) => (
          <span key={k} className="legend-item"><span className="dot" style={{ background: c.color }} />{c.label}</span>
        ))}
      </div>

      {picked && (
        <div className="modal" onClick={() => setPicked(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="pill" style={{ background: CATEGORIES[picked.category].color }}>
              {CATEGORIES[picked.category].emoji} {CATEGORIES[picked.category].label}
            </span>
            <h3>{picked.title}</h3>
            <p className="muted">{fmt(picked.date)}</p>
            {picked.detail && <p>{picked.detail}</p>}
            {picked.remind && <p className="small muted">🔔 Email reminders: {picked.remind.map((r) => `${r}d`).join(', ')} before</p>}
            <div className="modal-actions">
              {picked.link && <a className="btn" href={picked.link} target="_blank" rel="noreferrer">Open link ↗</a>}
              <button className="btn alt" onClick={() => { toggle(picked.id); setPicked(null); }}>
                {done[picked.id] ? 'Mark not done' : 'Mark done ✓'}
              </button>
              <button className="btn ghost" onClick={() => setPicked(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
