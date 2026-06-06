import { useState } from 'react';
import { EVENTS, CATEGORIES, STUDENT } from '../../shared/roadmap.js';
import { daysUntil, fmt, fmtShort, statusOf } from '../lib/util.js';

// ============================================================================
// "The Climb" — the roadmap as a mountain ascent.
//
// Every milestone (from shared/roadmap.js) becomes a waypoint on a switchback
// trail. The trail runs Base Camp (Summer 2026, bottom) → Summit (Decision Day,
// top). A little art-student climber stands at the family's real % complete —
// the SAME number the Dashboard shows (completed milestones ÷ total). Tap any
// waypoint to read it and check it off. All art is hand-drawn SVG, so it scales
// crisply and recolors with light/dark mode (it uses the app's CSS variables).
// ============================================================================

// ---- Geometry ----------------------------------------------------------------
const W = 360;                 // SVG canvas width (viewBox units)
const PAD_TOP = 120;           // room for the summit flag
const PAD_BOTTOM = 96;         // room for base camp
const STEP = 42;               // vertical distance between waypoints
const CENTER_X = 180;
const AMP = 104;               // how wide the switchbacks swing
const FREQ = 0.8;              // switchback wiggle frequency

// A point on the trail for "slot" s, where s = 0 is base camp and
// s = n+1 is the summit. Waypoint i sits at slot (i + 1).
function trailPoint(s, baseY, summitY, slots) {
  const t = s / slots;                       // 0 (base) → 1 (summit)
  const y = baseY - t * (baseY - summitY);
  const x = CENTER_X + AMP * Math.sin(s * FREQ);
  return { x, y };
}

export default function Climb({ done = {}, toggle = () => {} }) {
  // Chronological order = bottom of the mountain to the top.
  const events = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const n = events.length;
  const slots = n + 1;

  const completed = events.filter((e) => done[e.id]).length;
  const pct = n ? Math.round((completed / n) * 100) : 0;

  // The next thing to do = first chronological milestone not yet done.
  const nextUp = events.find((e) => !done[e.id]) || events[n - 1];
  const [selectedId, setSelectedId] = useState(null);
  const activeId = selectedId || (nextUp && nextUp.id);
  const selected = events.find((e) => e.id === activeId) || null;

  // Canvas height grows with the number of milestones (a tall climb you scroll).
  const H = PAD_TOP + PAD_BOTTOM + slots * STEP;
  const baseY = H - PAD_BOTTOM;
  const summitY = PAD_TOP;
  const base = trailPoint(0, baseY, summitY, slots);
  const summit = trailPoint(slots, baseY, summitY, slots);

  // Waypoint coordinates (index 0 = earliest, lowest on the mountain).
  const pts = events.map((e, i) => ({ ...trailPoint(i + 1, baseY, summitY, slots), e, i }));

  // Climber position: pct of the way from base to summit, riding the switchback.
  const frac = pct / 100;
  const climber = trailPoint(frac * slots, baseY, summitY, slots);

  // Trail split into "climbed" (solid) and "remaining" (dashed) at the climber.
  const climbedPts = [base, ...pts.filter((p) => p.i + 1 <= frac * slots), climber];
  const remainingPts = [climber, ...pts.filter((p) => p.i + 1 > frac * slots), summit];
  const toPolyline = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="screen">
      <h2>The Climb 🏔️</h2>
      <p className="muted">
        Your whole roadmap as one mountain. Every milestone is a step up; {STUDENT.name} climbs
        higher each time you check one off. The summit is Decision Day. 💜
      </p>

      <div className="cards">
        <div className="card stat highlight">
          <div className="stat-num">{pct}%</div>
          <div className="stat-label">Up the mountain</div>
          <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="card stat">
          <div className="stat-num">{completed}<span className="stat-of"> / {n}</span></div>
          <div className="stat-label">Waypoints reached</div>
        </div>
        <div className="card stat">
          <div className="stat-num">{n - completed}</div>
          <div className="stat-label">Steps to the summit</div>
        </div>
      </div>

      <div className="climb-wrap">
        <svg
          className="climb-svg"
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Mountain climb: ${pct}% complete, ${completed} of ${n} milestones done`}
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--violet-2)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.30" />
              <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* sky */}
          <rect x="0" y="0" width={W} height={H} fill="url(#sky)" />

          {/* far ridge + main peak (decorative) */}
          <polygon
            points={`0,${baseY} 120,${summitY + 70} 210,${baseY}`}
            fill="var(--violet)" opacity="0.08"
          />
          <polygon
            points={`${CENTER_X},${summitY - 26} ${W},${baseY + 30} 0,${baseY + 30}`}
            fill="url(#rock)" stroke="var(--line)" strokeWidth="1"
          />
          {/* snow cap */}
          <polygon
            points={`${CENTER_X},${summitY - 26} ${CENTER_X + 46},${summitY + 40} ${CENTER_X + 28},${summitY + 30} ${CENTER_X + 12},${summitY + 50} ${CENTER_X - 6},${summitY + 34} ${CENTER_X - 24},${summitY + 52} ${CENTER_X - 46},${summitY + 40}`}
            fill="#ffffff" opacity="0.85"
          />

          {/* full faint trail */}
          <polyline
            points={toPolyline([base, ...pts, summit])}
            fill="none" stroke="var(--line)" strokeWidth="8"
            strokeLinejoin="round" strokeLinecap="round"
          />
          {/* remaining (dashed) */}
          <polyline
            points={toPolyline(remainingPts)}
            fill="none" stroke="var(--muted)" strokeWidth="3"
            strokeDasharray="2 8" strokeLinecap="round" opacity="0.7"
          />
          {/* climbed (solid accent) */}
          <polyline
            points={toPolyline(climbedPts)}
            fill="none" stroke="var(--violet)" strokeWidth="5"
            strokeLinejoin="round" strokeLinecap="round"
          />

          {/* base camp */}
          <g>
            <text x={CENTER_X} y={baseY + 34} textAnchor="middle" className="climb-cap">🏕️ Base Camp</text>
            <text x={CENTER_X} y={baseY + 50} textAnchor="middle" className="climb-cap-sub">Summer 2026 — the journey begins</text>
          </g>

          {/* summit flag */}
          <g>
            <line x1={summit.x} y1={summit.y} x2={summit.x} y2={summit.y - 30} stroke="var(--ink)" strokeWidth="2.5" />
            <polygon points={`${summit.x},${summit.y - 30} ${summit.x + 30},${summit.y - 24} ${summit.x},${summit.y - 16}`} fill="var(--red)" />
            <text x={summit.x} y={summit.y - 40} textAnchor="middle" className="climb-cap">🎉 Summit · Decision Day</text>
            <text x={summit.x} y={summit.y + 4} textAnchor="middle" className="climb-cap-sub" dy="0">May 1, 2027</text>
          </g>

          {/* waypoints */}
          {pts.map(({ x, y, e, i }) => {
            const isDone = !!done[e.id];
            const isNext = nextUp && e.id === nextUp.id && !isDone;
            const isSel = selected && e.id === selected.id;
            const color = CATEGORIES[e.category].color;
            const labelLeft = x > CENTER_X; // put the date on the open side
            return (
              <g key={e.id} className="climb-wp" onClick={() => setSelectedId(e.id)} style={{ cursor: 'pointer' }}>
                <title>{`${e.title} — ${fmt(e.date)}`}</title>
                {/* big invisible tap target */}
                <circle cx={x} cy={y} r="20" fill="transparent" />
                {isNext && <circle cx={x} cy={y} r="15" className="climb-pulse" fill="none" stroke={color} strokeWidth="2" />}
                {isSel && <circle cx={x} cy={y} r="15" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 3" />}
                <circle cx={x} cy={y} r="10" fill={isDone ? color : 'var(--card)'} stroke={color} strokeWidth="3" />
                {isDone
                  ? <path d={`M${x - 4.5},${y} l3,3 l6,-6`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  : <text x={x} y={y + 3.5} textAnchor="middle" className="climb-wp-num">{i + 1}</text>}
                <text
                  x={labelLeft ? x - 18 : x + 18}
                  y={y + 3.5}
                  textAnchor={labelLeft ? 'end' : 'start'}
                  className="climb-date"
                >
                  {fmtShort(e.date)}
                </text>
              </g>
            );
          })}

          {/* the climber */}
          <Climber x={climber.x} y={climber.y} />
          <text x={climber.x} y={climber.y - 44} textAnchor="middle" className="climb-me">
            {STUDENT.name} · {pct}%
          </text>
        </svg>
      </div>

      {/* legend */}
      <div className="climb-legend">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <span className="climb-leg" key={key}>
            <span className="climb-leg-dot" style={{ background: c.color }} /> {c.emoji} {c.label}
          </span>
        ))}
      </div>

      {/* selected milestone detail */}
      {selected && (
        <section className={`card climb-detail ${statusOf(selected.date, done[selected.id])}`}>
          <div className="climb-detail-head">
            <span className="pill" style={{ background: CATEGORIES[selected.category].color }}>
              {CATEGORIES[selected.category].emoji} {CATEGORIES[selected.category].label}
            </span>
            {nextUp && selected.id === nextUp.id && !done[selected.id] && (
              <span className="pill climb-next">⛳ Next step</span>
            )}
          </div>
          <h3 style={{ margin: '6px 0' }}>{selected.title}</h3>
          <p className="muted small" style={{ margin: 0 }}>
            {fmt(selected.date)}
            {!done[selected.id] && (() => {
              const d = daysUntil(selected.date);
              return d < 0 ? ` · ${-d} day${d === -1 ? '' : 's'} overdue`
                : d === 0 ? ' · today' : ` · in ${d} day${d === 1 ? '' : 's'}`;
            })()}
          </p>
          {selected.detail && <p className="detail" style={{ marginTop: 8 }}>{selected.detail}</p>}
          <div className="editor-actions" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={() => toggle(selected.id)}>
              {done[selected.id] ? '↩ Mark not done' : '✓ Reached this waypoint'}
            </button>
            {selected.link && (
              <a className="btn ghost small" href={selected.link} target="_blank" rel="noreferrer">Open link ↗</a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// ---- The art-student climber (hand-drawn SVG) -------------------------------
// Brown hair, violet beret, a paint-splattered smock, a backpack, and a brush
// in hand — reaching up for the next hold. Drawn in a 30×42 local box with the
// feet at (x, y); we translate the whole group to the trail point.
function Climber({ x, y }) {
  return (
    <g transform={`translate(${x - 15}, ${y - 42})`} aria-hidden>
      {/* backpack */}
      <rect x="5" y="15" width="12" height="16" rx="4" fill="var(--violet-2)" stroke="var(--violet)" strokeWidth="0.8" />
      {/* legs */}
      <rect x="10" y="30" width="3.4" height="10" rx="1.5" fill="#3b3550" />
      <rect x="16.6" y="30" width="3.4" height="10" rx="1.5" fill="#3b3550" />
      {/* shoes */}
      <rect x="8.6" y="39" width="6" height="3" rx="1.5" fill="#d24" />
      <rect x="16" y="39" width="6" height="3" rx="1.5" fill="#d24" />
      {/* smock / apron with paint splatters */}
      <path d="M9 17 q6 -3 12 0 l1 13 q-7 3 -14 0 z" fill="#14b8a6" stroke="#0e8f86" strokeWidth="0.6" />
      <circle cx="13" cy="22" r="1.1" fill="var(--pink)" />
      <circle cx="18" cy="25" r="1.0" fill="var(--amber)" />
      <circle cx="15" cy="27" r="0.9" fill="var(--violet)" />
      {/* far (right) arm reaching up to a hold */}
      <line x1="20" y1="19" x2="25" y2="9" stroke="#f2c8a0" strokeWidth="2.4" strokeLinecap="round" />
      {/* near (left) arm holding a paintbrush */}
      <line x1="10" y1="19" x2="6" y2="26" stroke="#f2c8a0" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="6" y1="26" x2="3" y2="31" stroke="#a0673a" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="2.6" cy="31.6" r="1.3" fill="var(--pink)" />
      {/* head */}
      <circle cx="15" cy="10" r="6" fill="#f2c8a0" />
      {/* hair — brown, with a little length past the jaw */}
      <path d="M9 10 q-1 -8 6 -8 q7 0 6 8 q0 -4 -3 -5 q-3 3 -6 0 q-2 1 -3 5 z" fill="#6b3f2a" />
      <path d="M9 9 q-1 6 0 9 l1.5 0 q-1.5 -5 -0.3 -9 z" fill="#6b3f2a" />
      <path d="M21 9 q1 6 0 9 l-1.5 0 q1.5 -5 0.3 -9 z" fill="#6b3f2a" />
      {/* beret */}
      <ellipse cx="15" cy="4.4" rx="7" ry="3" fill="var(--violet)" />
      <circle cx="15" cy="2.2" r="0.9" fill="var(--violet-2)" />
      {/* face — a small happy look */}
      <circle cx="13" cy="10" r="0.7" fill="#3b2a20" />
      <circle cx="17" cy="10" r="0.7" fill="#3b2a20" />
      <path d="M13 12.4 q2 1.6 4 0" fill="none" stroke="#3b2a20" strokeWidth="0.7" strokeLinecap="round" />
    </g>
  );
}
