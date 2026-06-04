import { COLLEGES } from '../../shared/roadmap.js';
import { useStored, daysUntil, fmt } from '../lib/util.js';

const DEPOSIT_DAY = '2027-05-01';

const STAGES = [
  { id: 'planning',  label: 'Planning',     emoji: '📝', color: '#94a3b8' },
  { id: 'applied',   label: 'Applied',      emoji: '📨', color: '#0ea5e9' },
  { id: 'accepted',  label: 'Accepted',     emoji: '🎉', color: '#22c55e' },
  { id: 'waitlist',  label: 'Waitlisted',   emoji: '⏳', color: '#f59e0b' },
  { id: 'denied',    label: 'Denied',       emoji: '🚫', color: '#ef4444' },
  { id: 'committed', label: 'Committed ⭐',  emoji: '🏁', color: '#7c3aed' },
];

export default function Decisions() {
  const [state, setState] = useStored('viol_decisions', {});
  const dDay = daysUntil(DEPOSIT_DAY);

  function set(id, field, val) {
    setState((s) => ({ ...s, [id]: { ...s[id], [field]: val } }));
  }
  function commit(id) {
    setState((s) => {
      const next = { ...s };
      Object.keys(next).forEach((k) => {
        if (next[k]?.stage === 'committed') next[k] = { ...next[k], stage: 'accepted' };
      });
      next[id] = { ...next[id], stage: 'committed' };
      return next;
    });
  }

  const rows = [...COLLEGES].sort((a, b) => a.rank - b.rank);
  const committed = rows.find((c) => state[c.id]?.stage === 'committed');

  return (
    <div className="screen">
      <h2>Decision Tracker</h2>
      <p className="muted">Log each school as offers come in, record the award, and lock in the final choice.</p>

      <div className={`decision-day ${dDay <= 30 && dDay >= 0 ? 'soon' : ''}`}>
        <div className="dd-emoji">📬</div>
        <div>
          <strong>Decision Day — {fmt(DEPOSIT_DAY)}</strong>
          <div className="muted small">
            {dDay > 0 ? `${dDay} days to commit & pay the enrollment deposit` : dDay === 0 ? 'Today! Commit & deposit.' : 'Deposit deadline has passed.'}
          </div>
        </div>
        {committed && <span className="celebrate">✅ Committed to {committed.name.split(' (')[0]}!</span>}
      </div>

      <div className="cards two">
        {rows.map((c) => {
          const s = state[c.id] || {};
          const stage = s.stage || 'planning';
          const meta = STAGES.find((x) => x.id === stage);
          const name = c.name.split(' (')[0];
          return (
            <div key={c.id} className={`card decision ${stage === 'committed' ? 'pick' : ''}`}>
              <div className="card-head">
                <h3>{stage === 'committed' ? '⭐ ' : ''}{name}</h3>
                <span className="tag" style={{ background: meta.color, color: '#fff' }}>{meta.emoji} {meta.label}</span>
              </div>

              <div className="stage-picker">
                {STAGES.filter((x) => x.id !== 'committed').map((x) => (
                  <button key={x.id} className={`chip ${stage === x.id ? 'on' : ''}`} onClick={() => set(c.id, 'stage', x.id)}>{x.emoji} {x.label}</button>
                ))}
              </div>

              <label className="full">Award / aid offered<input value={s.award || ''} onChange={(e) => set(c.id, 'award', e.target.value)} placeholder="$ scholarship + aid total" /></label>
              <label className="full">Net price / year<input value={s.net || ''} onChange={(e) => set(c.id, 'net', e.target.value)} placeholder="what we'd actually pay" /></label>
              <label className="full">Notes<textarea rows={2} value={s.notes || ''} onChange={(e) => set(c.id, 'notes', e.target.value)} placeholder="pros, cons, gut feeling…" /></label>

              {stage === 'accepted' && (
                <button className="btn primary" onClick={() => commit(c.id)}>⭐ Commit here & pay deposit</button>
              )}
              {stage === 'committed' && (
                <button className="btn ghost" onClick={() => set(c.id, 'stage', 'accepted')}>Undo commit</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
