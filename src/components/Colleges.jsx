import { COLLEGES, FAMILY_RULES } from '../../shared/roadmap.js';
import { fmt, daysUntil } from '../lib/util.js';

const TIER = {
  likely: { label: 'Likely',  color: '#22c55e' },
  target: { label: 'Target',  color: '#7c3aed' },
  reach:  { label: 'Reach',   color: '#ef4444' },
};

export default function Colleges() {
  const rows = [...COLLEGES].sort((a, b) => a.rank - b.rank);
  return (
    <div className="screen">
      <h2>Colleges</h2>
      <p className="muted">Where to apply, when, what each one wants, and how it fits the budget. ⭐ = current best-fit pick.</p>

      <div className="cards two">
        {rows.map((c) => {
          const d = daysUntil(c.appDeadline);
          const isPick = c.name.startsWith(FAMILY_RULES.defaultPick);
          return (
            <div key={c.id} className={`card college ${isPick ? 'pick' : ''}`}>
              <div className="card-head">
                <h3>{isPick ? '⭐ ' : '🎓 '}{c.name}</h3>
                <span className="tag" style={{ background: TIER[c.tier].color, color: '#fff' }}>{TIER[c.tier].label}</span>
              </div>
              <div className="kv"><span>Acceptance</span><strong>{c.accept}</strong></div>
              <div className="kv"><span>App due</span><strong className={d < 30 && d >= 0 ? 'warn' : ''}>{fmt(c.appDeadline)} {d >= 0 ? `(${d}d)` : '(passed)'}</strong></div>
              <div className="kv"><span>Aid due</span><strong>{fmt(c.aidDeadline)}</strong></div>
              <p className="deliverable"><strong>What they value:</strong> {c.values}</p>
              <p className="deliverable money"><strong>💸 Affordability:</strong> {c.affordability}</p>
              <div className="tags">{c.verify && <span className="tag amber">Verify dates</span>}</div>
              <a className="btn" href={c.link} target="_blank" rel="noreferrer">Admissions ↗</a>
            </div>
          );
        })}
      </div>

      <section className="rules">
        <h3>📏 Family Rules</h3>
        <div className="cards">
          <div className="card rule"><div className="stat-num">${FAMILY_RULES.parentAnnual.toLocaleString()}</div><div className="stat-label">Parent contribution / year</div></div>
          <div className="card rule"><div className="stat-num">${FAMILY_RULES.studentAnnual.toLocaleString()}</div><div className="stat-label">Student contribution / year</div></div>
          <div className="card rule"><div className="stat-num">${FAMILY_RULES.studentDebtCeiling.toLocaleString()}</div><div className="stat-label">Student debt ceiling (4 yrs)</div></div>
          <div className="card rule"><div className="stat-num">⭐ {FAMILY_RULES.defaultPick}</div><div className="stat-label">Default best-fit pick</div></div>
        </div>
        <p className="walkaway"><strong>🚪 Walk-away rule:</strong> {FAMILY_RULES.walkAway}</p>
      </section>
    </div>
  );
}
