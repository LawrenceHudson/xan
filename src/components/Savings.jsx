import { FAMILY_RULES } from '../../shared/roadmap.js';
import { useStored } from '../lib/util.js';

export default function Savings() {
  const [saved, setSaved] = useStored('viol_saved', 0);
  const [log, setLog] = useStored('viol_savings_log', []);
  const [acct529, setAcct529] = useStored('viol_529', 0);
  const [brokerage, setBrokerage] = useStored('viol_brokerage', 0);
  const goalLow = FAMILY_RULES.savingsTargetLow;
  const goalHigh = FAMILY_RULES.savingsTargetHigh;
  const pct = Math.min(100, Math.round((saved / goalHigh) * 100));
  const totalAssets = (Number(saved) || 0) + (Number(acct529) || 0) + (Number(brokerage) || 0);

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

      <h3>College accounts</h3>
      <p className="muted small">Enter the current balance of each account. These feed the per-year funding plan on the Colleges tab (each is spread across 4 years there).</p>
      <div className="cards two">
        <div className="card">
          <label className="full">🎓 529 balance
            <span className="dollar">$<input type="number" min="0" step="100" value={acct529 || ''} onChange={(e) => setAcct529(Math.max(0, Number(e.target.value) || 0))} placeholder="0" /></span>
          </label>
        </div>
        <div className="card">
          <label className="full">📈 Brokerage balance
            <span className="dollar">$<input type="number" min="0" step="100" value={brokerage || ''} onChange={(e) => setBrokerage(Math.max(0, Number(e.target.value) || 0))} placeholder="0" /></span>
          </label>
        </div>
      </div>
      <div className="kv"><span>Total college assets (cash + 529 + brokerage)</span><strong>${totalAssets.toLocaleString()}</strong></div>

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
