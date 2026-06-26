import { useState } from 'react';
import { EVENTS, CATEGORIES } from '../../shared/roadmap.js';
import { parseDate, fmt, statusOf, useCustomItems, useVolunteer, volunteerToEvent, usePortfolioEvents, useRecommendationEvents } from '../lib/util.js';
import CalendarSync from './CalendarSync.jsx';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function CalendarView({ done, toggle }) {
  const { items: custom, add, remove } = useCustomItems();
  const { items: volunteer } = useVolunteer();
  const { items: portfolioEv } = usePortfolioEvents();
  const { items: recEv } = useRecommendationEvents();

  const allEvents = [
    ...EVENTS,
    ...custom,
    ...volunteer.map(volunteerToEvent).filter((v) => v.date),
    ...portfolioEv,
    ...recEv,
  ];

  const first = allEvents.map((e) => parseDate(e.date)).sort((a, b) => a - b)[0] || new Date();
  const [cursor, setCursor] = useState(new Date(first.getFullYear(), first.getMonth(), 1));
  const [picked, setPicked] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', date: '', detail: '', link: '' });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = {};
  for (const e of allEvents) {
    const d = parseDate(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      (byDay[d.getDate()] ||= []).push(e);
    }
  }

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function saveCustom() {
    if (!draft.title.trim() || !draft.date) return;
    add({ ...draft });
    const d = parseDate(draft.date);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    setDraft({ title: '', date: '', detail: '', link: '' });
    setAdding(false);
  }

  return (
    <div className="screen">
      <h2>Calendar</h2>
      <p className="muted">🔔 Built-in events auto-email a reminder <strong>1 week before</strong> (and 1 day before deadlines). Your own custom events, portfolio goal dates, and recommendation-letter dates also flow into the calendar feed and reminder email when sync is on. 📌</p>

      <div className="filters">
        <button className="btn primary" onClick={() => setAdding((a) => !a)}>{adding ? 'Close' : '+ Add custom event'}</button>
      </div>

      {adding && (
        <div className="card editor">
          <div className="form-row">
            <label className="full">Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g., Portfolio review with Ms. Lee" />
            </label>
          </div>
          <div className="form-row">
            <label>Date
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
            <label>Link (optional)
              <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
            </label>
          </div>
          <div className="form-row">
            <label className="full">Notes
              <textarea rows="2" value={draft.detail} onChange={(e) => setDraft({ ...draft, detail: e.target.value })} placeholder="Anything to remember." />
            </label>
          </div>
          <div className="editor-actions">
            <button className="btn" onClick={saveCustom}>Add to calendar</button>
            <button className="btn ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
          <p className="small muted">Custom events show on the Calendar and Roadmap. Synced custom events, portfolio goal dates, and recommendation-letter dates also participate in the calendar feed and reminder email.</p>
        </div>
      )}

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

      <CalendarSync />

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
            {picked.readonly && picked.portfolio && <p className="small muted">🎨 This is a portfolio goal date. Manage it on the <strong>Portfolio</strong> tab — mark the piece “final” there to clear the reminder.</p>}
            {picked.readonly && picked.recommendation && <p className="small muted">✉️ This is a recommendation-letter date. Manage it on the <strong>Recommendations</strong> tab — mark the letter “received” there to clear the reminder.</p>}
            <div className="modal-actions">
              {picked.link && <a className="btn" href={picked.link} target="_blank" rel="noreferrer">Open link ↗</a>}
              {!picked.readonly && (
                <button className="btn alt" onClick={() => { toggle(picked.id); setPicked(null); }}>
                  {done[picked.id] ? 'Mark not done' : 'Mark done ✓'}
                </button>
              )}
              {picked.custom && (
                <button className="btn danger" onClick={() => { remove(picked.id); setPicked(null); }}>Remove</button>
              )}
              <button className="btn ghost" onClick={() => setPicked(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
