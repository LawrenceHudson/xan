import { FAMILY_RULES } from '../../shared/roadmap.js';
import { useStored } from '../lib/util.js';

export default function Savings() {
  const [saved, setSaved] = useStored('viol_saved', 0);
  const [log, setLog] = useStored('viol_savings_log', []);
  const goalLow = FAMILY_RULES.savingsTargetLow;
  const goalHigh = FAMILY_RULES.savingsTargetHigh;
  const pct = Math.min(100, Math.round((saved / goalHigh) * 100));

  function addEntry(e) {
    e.preventDefault();
    const amt = Number(e.target.amount.value);
    const note = e.target.note.value.trim();
    if (!amt) return;
    setSaved((s) => Math.max(0, s + amt));
    setLog((l) => [{ id: Date.now(), amt, note, when: new Date().toISOString().slice(0, 10) }, ...l]);
    e.target.reset();
  }

  return (
    <div className="screen">
      <h2>Savings</h2>
      <p className="muted">Goal: ${goalLow.toLocaleString()}–${goalHigh.toLocaleString()} by Fall 2027 (~$533–$800/mo). Every deposit + scholarship win counts.</p>

      <div className="card stat highlight">
        <div className="stat-num">${saved.toLocaleString()}</div>
        <div className="stat-label">Saved so far</div>
        <div className="bar big"><div className="bar-fill green" style={{ width: `${pct}%` }} /></div>
        <div className="muted small">{pct}% of the ${goalHigh.toLocaleString()} stretch goal</div>
        {saved >= goalLow && <div className="celebrate">🎉 You passed the ${goalLow.toLocaleString()} target!</div>}
      </div>

      <form className="savings-form" onSubmit={addEntry}>
        <input name="amount" type="number" step="1" placeholder="Amount (+ deposit, − withdrawal)" />
        <input name="note" type="text" placeholder="Note (job, gift, scholarship win…)" />
        <button className="btn" type="submit">Log it</button>
      </form>

      {log.length > 0 && (
        <table className="savings-table">
          <thead><tr><th>Date</th><th>Amount</th><th>Note</th></tr></thead>
          <tbody>
            {log.map((r) => (
              <tr key={r.id}>
                <td>{r.when}</td>
                <td className={r.amt < 0 ? 'neg' : 'pos'}>{r.amt < 0 ? '−' : '+'}${Math.abs(r.amt).toLocaleString()}</td>
                <td>{r.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
