import { SCHOLARSHIPS, FAMILY_RULES } from './roadmap.js';

function todayLocal(ref = new Date()) {
  return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
}

function parseDate(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function daysUntilDate(iso, ref = new Date()) {
  const due = parseDate(iso);
  if (!due) return null;
  return Math.round((due - todayLocal(ref)) / 86400000);
}

export function remindersFrom(events = [], ref = new Date()) {
  const out = [];
  for (const e of events) {
    if (!e || !e.date) continue;
    const days = daysUntilDate(e.date, ref);
    if (days == null) continue;
    const remind = e.remind || [7];
    if (remind.includes(days)) out.push({ ...e, days });
  }
  return out;
}

export function awardedPerYearForCollege(statusMap = {}, collegeId, scholarships = SCHOLARSHIPS) {
  let perYear = 0;
  for (const s of scholarships) {
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

export function buildCollegeFundingPlan(college, {
  cash = 0,
  a529 = 0,
  broker = 0,
  scholarshipStatus = {},
  actualAid,
  familyRules = FAMILY_RULES,
  scholarships = SCHOLARSHIPS,
} = {}) {
  const cost = Number(college?.costYear) || 0;
  const aidIsActual = actualAid !== undefined && actualAid !== '' && actualAid !== null;
  const aid = aidIsActual ? Number(actualAid) || 0 : (Number(college?.avgAidYear) || 0);
  const scholYr = awardedPerYearForCollege(scholarshipStatus, college?.id, scholarships);
  const a529Yr = (Number(a529) || 0) / 4;
  const cashYr = (Number(cash) || 0) / 4;
  const brokerYr = (Number(broker) || 0) / 4;
  const nonLoan = aid + scholYr + a529Yr + cashYr + brokerYr;
  const gap = Math.max(0, cost - nonLoan);
  const studentCapYear = (Number(familyRules?.studentDebtCeiling) || 0) / 4;
  const parentCapYear = Number(familyRules?.parentAnnual) || 0;
  const studentLoan = Math.min(gap, studentCapYear);
  const parentLoan = Math.min(Math.max(gap - studentLoan, 0), parentCapYear);
  const shortfall = Math.max(0, gap - studentLoan - parentLoan);
  const debtFree = nonLoan >= cost;

  return {
    cost,
    aid,
    aidIsActual,
    scholYr,
    a529Yr,
    cashYr,
    brokerYr,
    nonLoan,
    gap,
    studentLoan,
    parentLoan,
    shortfall,
    debtFree,
    studentCapYear,
    parentCapYear,
  };
}
