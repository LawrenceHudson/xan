import { EVENTS, CATEGORIES, FAMILY_RULES, PORTFOLIO } from '../../shared/roadmap.js';
import { daysUntil, fmt, statusOf, useStored } from '../lib/util.js';

export default function Dashboard({ done, toggle, goTo }) {
  const total = EVENTS.length;
  const completed = EVENTS.filter((e) => done[e.id]).length;
  const pct = Math.round((completed / total) * 100);

  const overdue = EVENTS.filter((e) => statusOf(e.date, done[e.id]) === 'overdue');
  const next30 = EVENTS
    .filter((e) => !done[e.id] && daysUntil(e.date) >= 0 && daysUntil(e.date) <= 30)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  // Live "creative momentum" metrics, read straight from what Violet logs.
  const [portfolio] = useStored('viol_portfolio', []);
  const [achievements] = useStored('viol_achievements', []);
  const [writing] = useStored('viol_writing', []);
  const [volunteer] = useStored('viol_volunteer', []);
  const [saved] = useStored('viol_saved', 0);

  const finals = portfolio.filter((p) => p.status === 'final').length;
  const portfolioPct = Math.min(100, Math.round((finals / PORTFOLIO.targetPieces) * 100));
  const volunteerHours = volunteer.reduce((sum, v) => sum + (Number(v.hours) || 0), 0);
  const essays = writing.filter((w) => w.category === 'essay').length;
  const goalLow = FAMILY_RULES.savingsTargetLow;
  const goalHigh = FAMILY_RULES.savingsTargetHigh;
  const savedPct = Math.min(100, Math.round((Number(saved) / goalHigh) * 100));

  return (
    <div className="screen">
      <h2>Dashboard</h2>

      <div className="cards">
        <div className="card stat">
          <div className="stat-num">{pct}%</div>
          <div className="stat-label">Roadmap complete</div>
          <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
          <div className="muted small">{completed} of {total} milestones done</div>
        </div>
        <div className="card stat">
          <div className="stat-num" style={{ color: overdue.length ? '#ef4444' : '#22c55e' }}>
            {overdue.length}
          </div>
          <div className="stat-label">Overdue</div>
          <button className="link" onClick={() => goTo('timeline')}>Open roadmap →</button>
        </div>
        <div className="card stat">
          <div className="stat-num">{next30.length}</div>
          <div className="stat-label">Due in 30 days</div>
          <button className="link" onClick={() => goTo('calendar')}>See calendar →</button>
        </div>
        <div className="card stat highlight">
          <div className="stat-num">⭐ {FAMILY_RULES.defaultPick}</div>
          <div className="stat-label">Current best-fit pick</div>
          <button className="link" onClick={() => goTo('colleges')}>Compare schools →</button>
        </div>
      </div>

      <h3 className="section-h">🎨 Creative momentum</h3>
      <div className="cards">
        <div className="card stat">
          <div className="stat-num">{finals}<span className="stat-of"> / {PORTFOLIO.targetPieces}</span></div>
          <div className="stat-label">Portfolio finals</div>
          <div className="bar"><div className="bar-fill" style={{ width: `${portfolioPct}%` }} /></div>
          <button className="link" onClick={() => goTo('portfolio')}>Open portfolio →</button>
        </div>
        <div className="card stat">
          <div className="stat-num">{achievements.length}</div>
          <div className="stat-label">Achievements logged</div>
          <button className="link" onClick={() => goTo('achieve')}>See wins →</button>
        </div>
        <div className="card stat">
          <div className="stat-num">{writing.length}</div>
          <div className="stat-label">Writing pieces{essays > 0 ? ` · ${essays} essay${essays === 1 ? '' : 's'}` : ''}</div>
          <button className="link" onClick={() => goTo('writing')}>Open writing →</button>
        </div>
        <div className="card stat">
          <div className="stat-num">{volunteerHours}</div>
          <div className="stat-label">Volunteer hours</div>
          <button className="link" onClick={() => goTo('volunteer')}>Log hours →</button>
        </div>
        <div className="card stat">
          <div className="stat-num">${Number(saved).toLocaleString()}</div>
          <div className="stat-label">Saved of ${goalHigh.toLocaleString()}</div>
          <div className="bar"><div className="bar-fill" style={{ width: `${savedPct}%` }} /></div>
          <button className="link" onClick={() => goTo('savings')}>Track savings →</button>
        </div>
      </div>

      {overdue.length > 0 && (
        <section>
          <h3 className="danger">⚠️ Overdue — handle these first</h3>
          <ul className="evlist">
            {overdue.map((e) => (
              <li key={e.id} className="evrow overdue">
                <button className="check" onClick={() => toggle(e.id)} aria-label="mark done">○</button>
                <div className="evmeta">
                  <span className="pill" style={{ background: CATEGORIES[e.category].color }}>
                    {CATEGORIES[e.category].emoji} {CATEGORIES[e.category].label}
                  </span>
                  <strong>{e.title}</strong>
                  <span className="muted small">{fmt(e.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>📌 Next 30 days</h3>
        {next30.length === 0 && <p className="muted">Nothing due in the next 30 days. Breathe — then make art. 🎨</p>}
        <ul className="evlist">
          {next30.map((e) => {
            const d = daysUntil(e.date);
            return (
              <li key={e.id} className={`evrow ${statusOf(e.date, false)}`}>
                <button className="check" onClick={() => toggle(e.id)} aria-label="mark done">○</button>
                <div className="evmeta">
                  <span className="pill" style={{ background: CATEGORIES[e.category].color }}>
                    {CATEGORIES[e.category].emoji} {CATEGORIES[e.category].label}
                  </span>
                  <strong>{e.title}</strong>
                  <span className="muted small">{fmt(e.date)} · {d === 0 ? 'today' : `in ${d} day${d === 1 ? '' : 's'}`}</span>
                  {e.detail && <span className="detail">{e.detail}</span>}
                  {e.link && <a className="extlink" href={e.link} target="_blank" rel="noreferrer">Open ↗</a>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
