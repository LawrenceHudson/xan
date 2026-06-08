import { COLLEGES, SCHOLARSHIPS, FAMILY_RULES } from '../../shared/roadmap.js';
import { fmt, daysUntil, useStored } from '../lib/util.js';

const TIER = {
  likely: { label: 'Likely',  color: '#22c55e' },
  target: { label: 'Target',  color: '#7c3aed' },
  reach:  { label: 'Reach',   color: '#ef4444' },
};

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString();

// PER-YEAR sum of AWARDED scholarship dollars that apply to a given college.
// A scholarship applies if it has no college tags (portable / applies to all)
// or this college is in its tag list. A one-time award is spread across 4 years
// (÷4); a renewable "every year" award counts in full each year.
function awardedPerYearForCollege(statusMap, collegeId) {
  let perYear = 0;
  for (const s of SCHOLARSHIPS) {
    const e = statusMap[s.id];
    if (!e || e.status !== 'awarded') continue;
    const tags = e.colleges || [];
    if (tags.length === 0 || tags.includes(collegeId)) {
      const amt = Number(e.amount) || 0;
      perYear += e.duration === 'four' ? amt : amt / 4;
    }
  }
  return perYear;
}

export default function Colleges() {
  const [cash] = useStored('viol_saved', 0);
  const [a529] = useStored('viol_529', 0);
  const [broker] = useStored('viol_brokerage', 0);
  const [schStatus] = useStored('viol_scholar_status', {});
  const [aidMap, setAidMap] = useStored('viol_college_aid', {});

  // Per-year loan caps. Student is a 4-year ceiling → divide by 4. Parent is
  // already an annual figure → use as-is.
  const studentCapYear = (FAMILY_RULES.studentDebtCeiling || 0) / 4;
  const parentCapYear = FAMILY_RULES.parentAnnual || 0;

  const rows = [...COLLEGES].sort((a, b) => a.rank - b.rank);

  return (
    <div className="screen">
      <h2>Colleges</h2>
      <p className="muted">Where to apply, when, what each one wants, and a per-year funding plan. ⭐ = current best-fit pick.</p>

      <div className="cards two">
        {rows.map((c) => {
          const d = daysUntil(c.appDeadline);
          const isPick = c.name.startsWith(FAMILY_RULES.defaultPick);

          // --- Funding plan (per year) -------------------------------------
          const cost = c.costYear || 0;
          const actualRaw = aidMap[c.id];
          const aidIsActual = actualRaw !== undefined && actualRaw !== '' && actualRaw !== null;
          const aid = aidIsActual ? Number(actualRaw) || 0 : (c.avgAidYear || 0);
          const scholYr = awardedPerYearForCollege(schStatus, c.id);
          const a529Yr = (Number(a529) || 0) / 4;
          const cashYr = (Number(cash) || 0) / 4;
          const brokerYr = (Number(broker) || 0) / 4;
          const nonLoan = aid + scholYr + a529Yr + cashYr + brokerYr;
          const gap = Math.max(0, cost - nonLoan);
          const studentLoan = Math.min(gap, studentCapYear);
          const parentLoan = Math.min(Math.max(gap - studentLoan, 0), parentCapYear);
          const shortfall = Math.max(0, gap - studentLoan - parentLoan);
          const debtFree = nonLoan >= cost;

          return (
            <div key={c.id} className={`card college ${isPick ? 'pick' : ''}`}>
              <div className="card-head">
                <h3>{isPick ? '⭐ ' : '🎓 '}{c.name}</h3>
                <span className="tag" style={{ background: TIER[c.tier].color, color: '#fff' }}>{TIER[c.tier].label}</span>
              </div>
              <div className="kv"><span>Acceptance</span><strong>{c.accept}</strong></div>
              <div className="kv"><span>App due</span><strong className={d < 30 && d >= 0 ? 'warn' : ''}>{fmt(c.appDeadline)} {d >= 0 ? `(${d}d)` : '(passed)'}</strong></div>
              <div className="kv"><span>Aid due</span><strong>{fmt(c.aidDeadline)}</strong></div>
              {c.visitDate && <div className="kv"><span>Visit (tentative)</span><strong>{fmt(c.visitDate)}</strong></div>}

              <div className="cost-box">
                {c.totalPrice && <div className="kv"><span>Total price</span><strong>{c.totalPrice}</strong></div>}
                {c.avgAid && <div className="kv"><span>Avg aid</span><strong>{c.avgAid}</strong></div>}
                {c.netPrice && <div className="kv"><span>Avg net price</span><strong className="net">{c.netPrice}</strong></div>}
                {c.costNote && <p className="costnote">{c.costNote}</p>}
                {c.npcLink && <a className="btn small" href={c.npcLink} target="_blank" rel="noreferrer">Net Price Calculator ↗</a>}
              </div>

              {/* ---- Per-year funding plan ---- */}
              <div className="fund-box">
                <div className="fund-title">💵 Funding plan <span className="muted small">· per year</span></div>

                <label className="fund-actual">Your actual aid offer (per year)
                  <span className="dollar">$<input
                    type="number" min="0" step="100"
                    value={actualRaw ?? ''}
                    onChange={(e) => setAidMap((m) => ({ ...m, [c.id]: e.target.value }))}
                    placeholder={`avg ${ (c.avgAidYear || 0).toLocaleString() }`}
                  /></span>
                </label>

                <div className="fund-row top"><span>Top cost</span><strong>{money(cost)}</strong></div>
                <div className="fund-row"><span>− Financial aid <em>{aidIsActual ? '(actual)' : '(avg)'}</em></span><strong>−{money(aid)}</strong></div>
                <div className="fund-row"><span>− Scholarships <em>(per year)</em></span><strong>−{money(scholYr)}</strong></div>
                <div className="fund-row"><span>− 529 <em>(÷ 4)</em></span><strong>−{money(a529Yr)}</strong></div>
                <div className="fund-row"><span>− Cash savings <em>(÷ 4)</em></span><strong>−{money(cashYr)}</strong></div>
                <div className="fund-row"><span>− Brokerage <em>(÷ 4)</em></span><strong>−{money(brokerYr)}</strong></div>
                <div className="fund-row loan"><span>− Student loan <em>(≤ {money(studentCapYear)})</em></span><strong>−{money(studentLoan)}</strong></div>
                <div className="fund-row loan"><span>− Parent loan <em>(≤ {money(parentCapYear)})</em></span><strong>−{money(parentLoan)}</strong></div>

                <div className="fund-result">
                  {debtFree ? (
                    <span className="fund-win">🎉 Debt-free win</span>
                  ) : shortfall > 0 ? (
                    <span className="fund-short">Needs {money(shortfall)} more to break even</span>
                  ) : (
                    <span className="fund-ok">$0 remaining — covered ✓</span>
                  )}
                </div>
              </div>

              <p className="deliverable"><strong>What they value:</strong> {c.values}</p>
              <p className="deliverable money"><strong>💸 Affordability:</strong> {c.affordability}</p>
              <div className="tags">{c.verify && <span className="tag amber">Verify costs &amp; dates</span>}</div>
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
