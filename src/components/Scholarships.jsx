import { SCHOLARSHIPS, COLLEGES } from '../../shared/roadmap.js';
import { fmt, daysUntil, useStored } from '../lib/util.js';

// Status options for each scholarship. Only "Awarded" amounts feed the college
// funding calculator.
const SCH_STATUS = [
  { id: 'applied', label: 'Applied', color: '#7c3aed' },
  { id: 'awarded', label: 'Awarded', color: '#16a34a' },
  { id: 'denied',  label: 'Denied',  color: '#ef4444' },
  { id: 'missed',  label: 'Missed',  color: '#6b7280' },
];

const SCHOOL_OPTS = COLLEGES.map((c) => ({ id: c.id, label: c.name.split(' (')[0] }));

export default function Scholarships() {
  // { [schId]: { status, amount, colleges: [] } }. colleges empty = applies to all.
  const [state, setState] = useStored('viol_scholar_status', {});

  const get = (id) => state[id] || { status: '', amount: 0, colleges: [], duration: 'one' };
  const setStatus = (id, status) =>
    setState((s) => ({ ...s, [id]: { ...get(id), status: get(id).status === status ? '' : status } }));
  const setAmount = (id, amount) =>
    setState((s) => ({ ...s, [id]: { ...get(id), amount: Math.max(0, Number(amount) || 0) } }));
  const setDuration = (id, duration) =>
    setState((s) => ({ ...s, [id]: { ...get(id), duration } }));
  const toggleCollege = (id, cid) =>
    setState((s) => {
      const cur = get(id);
      const has = (cur.colleges || []).includes(cid);
      return { ...s, [id]: { ...cur, colleges: has ? cur.colleges.filter((x) => x !== cid) : [...(cur.colleges || []), cid] } };
    });

  // Running total = the full 4-year value of everything awarded (a renewable
  // award is worth its yearly amount × 4).
  const awardedTotal = SCHOLARSHIPS.reduce((sum, s) => {
    const e = state[s.id];
    if (!e || e.status !== 'awarded') return sum;
    const amt = Number(e.amount) || 0;
    return sum + (e.duration === 'four' ? amt * 4 : amt);
  }, 0);
  const awardedCount = SCHOLARSHIPS.filter((s) => state[s.id] && state[s.id].status === 'awarded').length;

  const rows = [...SCHOLARSHIPS].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  return (
    <div className="screen">
      <h2>Scholarships</h2>
      <p className="muted">When to start, what to submit, by when, and where. Mark where each one stands — awarded amounts flow into the Colleges funding plan.</p>

      {awardedCount > 0 && (
        <div className="card stat highlight">
          <div className="stat-num">${awardedTotal.toLocaleString()}</div>
          <div className="stat-label">Awarded so far (4-yr value) · {awardedCount} scholarship{awardedCount === 1 ? '' : 's'}</div>
        </div>
      )}

      <div className="cards two">
        {rows.map((s) => {
          const d = daysUntil(s.deadline);
          const e = get(s.id);
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

              <div className="sch-status">
                {SCH_STATUS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`status-btn ${e.status === st.id ? 'on' : ''}`}
                    style={e.status === st.id ? { background: st.color, borderColor: st.color, color: '#fff' } : null}
                    onClick={() => setStatus(s.id, st.id)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {e.status === 'awarded' && (
                <div className="sch-award">
                  <div className="award-line">
                    <label className="award-type">Award type
                      <select value={e.duration || 'one'} onChange={(ev) => setDuration(s.id, ev.target.value)}>
                        <option value="one">One-time</option>
                        <option value="four">Every year (4 yrs)</option>
                      </select>
                    </label>
                    <label className="award-amt">{(e.duration === 'four') ? 'Amount / year' : 'Total awarded'}
                      <span className="dollar">$<input type="number" min="0" step="100" value={e.amount || ''} onChange={(ev) => setAmount(s.id, ev.target.value)} placeholder="0" /></span>
                    </label>
                  </div>
                  <p className="muted small">{(e.duration === 'four') ? 'Counts in full every year (worth ×4 over four years).' : 'A one-time award, spread across 4 years (÷4 per year).'}</p>
                  <div className="award-applies">
                    <span className="picker-label">Applies to {(!e.colleges || e.colleges.length === 0) ? '(all schools)' : ''}:</span>
                    {SCHOOL_OPTS.map((o) => (
                      <button key={o.id} type="button" className={`chip ${(e.colleges || []).includes(o.id) ? 'on' : ''}`} onClick={() => toggleCollege(s.id, o.id)}>{o.label}</button>
                    ))}
                  </div>
                </div>
              )}

              <a className="btn" href={s.link} target="_blank" rel="noreferrer">Apply / details ↗</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
