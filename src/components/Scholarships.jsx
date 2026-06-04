import { SCHOLARSHIPS } from '../../shared/roadmap.js';
import { fmt, daysUntil } from '../lib/util.js';

export default function Scholarships() {
  const rows = [...SCHOLARSHIPS].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
  return (
    <div className="screen">
      <h2>Scholarships</h2>
      <p className="muted">When to start, what to submit, by when, and where. Start the moment it opens — early apps win.</p>
      <div className="cards two">
        {rows.map((s) => {
          const d = daysUntil(s.deadline);
          return (
            <div key={s.id} className="card sch">
              <div className="card-head">
                <h3>🏆 {s.name}</h3>
                <span className="value">{s.value}</span>
              </div>
              <div className="kv"><span>Opens</span><strong>{fmt(s.opens)}</strong></div>
              <div className="kv"><span>Deadline</span><strong className={d < 14 && d >= 0 ? 'warn' : ''}>{fmt(s.deadline)} {d >= 0 ? `(${d}d)` : '(passed)'}</strong></div>
              <p className="deliverable"><strong>Deliverable:</strong> {s.deliverable}</p>
              <div className="tags">
                {s.portable && <span className="tag green">Portable</span>}
                {s.needsRecLetter && <span className="tag blue">Needs rec letter ✉️</span>}
                {s.verify && <span className="tag amber">Verify date</span>}
              </div>
              <a className="btn" href={s.link} target="_blank" rel="noreferrer">Apply / details ↗</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
