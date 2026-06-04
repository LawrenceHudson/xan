// ============================================================================
// Violet's Art School Roadmap — single source of truth.
// Imported by BOTH the React app (src/) and the email reminder job (api/).
//
// IMPORTANT: dates marked `verify: true` were taken from a planning brief and
// are approximate. Confirm each one on the official site (the `link`) before
// relying on it. The app surfaces a "Verify date" badge for these.
//
// All dates are ISO "YYYY-MM-DD". Edit freely — the whole app and the email
// reminders update automatically.
// ============================================================================

export const STUDENT = { name: 'Violet', nickname: 'Xanderr', enrollTerm: 'Fall 2027' };

// ---------------------------------------------------------------------------
// Category styling/labels used across the app.
// ---------------------------------------------------------------------------
export const CATEGORIES = {
  portfolio:   { label: 'Portfolio',      color: '#ec4899', emoji: '🎨' },
  scholarship: { label: 'Scholarship',    color: '#f59e0b', emoji: '🏆' },
  application: { label: 'College App',    color: '#7c3aed', emoji: '🎓' },
  financial:   { label: 'Financial Aid',  color: '#10b981', emoji: '💸' },
  recommend:   { label: 'Rec Letters',    color: '#0ea5e9', emoji: '✉️' },
  savings:     { label: 'Savings',        color: '#22c55e', emoji: '🐖' },
};

// ---------------------------------------------------------------------------
// COLLEGES
// ---------------------------------------------------------------------------
export const COLLEGES = [
  {
    id: 'massart',
    name: 'MassArt (Massachusetts College of Art and Design)',
    tier: 'target',                 // likely | target | reach
    rank: 1,                        // family preference order
    accept: '~77%',
    values: 'Holistic review — portfolio score, creative potential, and academic readiness. Recommended GPA 3.0. New England resident rate is a major cost advantage for NH families.',
    link: 'https://massart.edu/admissions',
    appDeadline: '2026-12-01',
    aidDeadline: '2027-02-01',
    affordability: 'Best financial fit. NE resident rate + automatic merit review. What you pay can vary with portfolio score, so strengthening the portfolio directly lowers cost.',
    verify: true,
  },
  {
    id: 'meca',
    name: 'MECA&D (Maine College of Art & Design)',
    tier: 'target',
    rank: 2,
    accept: 'High (merit-friendly)',
    values: 'Merit scholarships based on HS achievement, portfolio strength, community engagement, leadership, and work ethic. Extra value for Scholastic Art Award winners. First-year scholarships ~$15k–$23k.',
    link: 'https://www.meca.edu/admissions/',
    appDeadline: '2026-12-01',
    aidDeadline: '2027-02-15',
    affordability: 'Workable with strong merit aid; may need some borrowing or better-than-benchmark aid. Stack Scholastic wins for added scholarship value.',
    verify: true,
  },
  {
    id: 'risd',
    name: 'RISD (Rhode Island School of Design)',
    tier: 'reach',
    rank: 3,
    accept: '~14–19%',
    values: 'Strongest indicators are portfolio work, the visual responses, and GPA. Test-optional. Institutional funding is primarily NEED-based, not broad automatic merit.',
    link: 'https://www.risd.edu/admissions',
    appDeadline: '2027-01-15',
    aidDeadline: '2027-02-01',
    affordability: 'Aspirational reach. Expensive even with decent aid. Do NOT build the financial plan around RISD — only pursue if the real net price lands within the family guardrails.',
    verify: true,
  },
  {
    id: 'calarts',
    name: 'CalArts (California Institute of the Arts)',
    tier: 'reach',
    rank: 4,
    accept: 'Reach / portfolio-driven',
    values: 'Program-specific portfolio or audition required. Auto-considered for merit scholarships based on artistic + academic potential, originality, and strength of work. Merit starts at $10k/yr (limited, competitive).',
    link: 'https://admissions.calarts.edu/',
    appDeadline: '2027-01-05',
    aidDeadline: '2027-02-01',
    affordability: 'Riskiest financially under the current plan. Treat as a creative reach, not a financial base case.',
    verify: true,
  },
];

// ---------------------------------------------------------------------------
// SCHOLARSHIPS
// ---------------------------------------------------------------------------
export const SCHOLARSHIPS = [
  {
    id: 'youngarts',
    name: 'YoungArts',
    value: '$250–$10,000',
    portable: true,
    link: 'https://youngarts.org/apply/',
    opens: '2026-07-01',
    deadline: '2026-10-15',
    deliverable: 'Submit work in your discipline (visual art portfolio). Portable national recognition + cash; also strengthens RISD positioning.',
    needsRecLetter: false,
    verify: true,
  },
  {
    id: 'scholastic',
    name: 'Scholastic Art & Writing Awards',
    value: 'Up to $12,500',
    portable: true,
    link: 'https://www.artandwriting.org/',
    opens: '2026-10-01',
    deadline: '2026-12-15',
    deliverable: 'Submit art pieces to your regional program. National recognition + scholarships; adds direct value at MECA&D.',
    needsRecLetter: false,
    verify: true,
  },
  {
    id: 'cocacola',
    name: 'Coca-Cola Scholars',
    value: '$20,000',
    portable: true,
    link: 'https://www.coca-colascholarsfoundation.org/apply/',
    opens: '2026-08-03',
    deadline: '2026-10-31',
    deliverable: 'Online application — academics, leadership, service. School-agnostic and highly portable.',
    needsRecLetter: false,
    verify: true,
  },
  {
    id: 'elks',
    name: 'Elks Most Valuable Student',
    value: 'Varies (portable)',
    portable: true,
    link: 'https://www.elks.org/scholars/scholarships/mvs.cfm',
    opens: '2026-08-01',
    deadline: '2026-11-15',
    deliverable: 'Application + essays; portable to any accredited 4-year U.S. college.',
    needsRecLetter: true,
    verify: true,
  },
  {
    id: 'nhcf',
    name: 'NH Charitable Foundation',
    value: 'Varies (NH students)',
    portable: true,
    link: 'https://www.nhcf.org/what-we-offer/support-for-students/apply-for-a-scholarship/',
    opens: '2027-01-26',
    deadline: '2027-04-09',
    deliverable: 'Single application opens many NH funds. Broadly useful for NH students.',
    needsRecLetter: true,
    verify: true,
  },
  {
    id: 'fafsa',
    name: 'FAFSA 2027–28 + School Aid',
    value: 'Federal + institutional aid',
    portable: true,
    link: 'https://studentaid.gov/h/apply-for-aid/fafsa',
    opens: '2026-10-01',
    deadline: '2026-12-01',
    deliverable: 'File FAFSA as early as possible, then complete each school’s institutional aid steps. Earlier = more available funding.',
    needsRecLetter: false,
    verify: true,
  },
];

// ---------------------------------------------------------------------------
// MILESTONES / EVENTS  (the calendar + timeline + checklist all read this)
// `date` is the action/deadline date. `remind` = days-before to email.
// ---------------------------------------------------------------------------
export const EVENTS = [
  // ---- Summer 2026: foundation ----
  { id: 'm-portfolio-summer', date: '2026-08-15', category: 'portfolio', title: 'Finalize 3–4 strong portfolio pieces', detail: 'Lock in your best work for YoungArts + early apps. Quality over quantity.', link: '', remind: [14, 7, 1] },
  { id: 'm-savings-goal', date: '2026-07-01', category: 'savings', title: 'Set savings goal & start tracking', detail: 'Target $8k–$12k by Fall 2027 (~$533–$800/mo). Log monthly progress in the Savings tab.', link: '', remind: [7] },
  { id: 'm-youngarts-prep', date: '2026-08-01', category: 'scholarship', title: 'Prep YoungArts submission', detail: 'YoungArts opens ~Summer 2026. Get your portfolio pieces submission-ready.', link: 'https://youngarts.org/apply/', remind: [14, 7] },

  // ---- Aug–Sep 2026: scholarships open + rec letters ----
  { id: 'm-elks-open', date: '2026-08-01', category: 'scholarship', title: 'Elks MVS opens — start application', detail: 'Portable to any 4-yr U.S. college. Needs a recommendation letter.', link: 'https://www.elks.org/scholars/scholarships/mvs.cfm', remind: [7, 1] },
  { id: 'm-cocacola-open', date: '2026-08-03', category: 'scholarship', title: 'Coca-Cola Scholars opens — apply', detail: '$20,000, school-agnostic, highly portable.', link: 'https://www.coca-colascholarsfoundation.org/apply/', remind: [7, 1] },
  { id: 'm-rec-requests', date: '2026-09-15', category: 'recommend', title: 'Ask teachers for recommendation letters', detail: 'Give recommenders 4+ weeks. Needed for Elks, NHCF, and several college apps.', link: '', remind: [14, 7] },

  // ---- Oct–Dec 2026: FAFSA, Scholastic, college apps ----
  { id: 'm-fafsa-open', date: '2026-10-01', category: 'financial', title: 'FAFSA 2027–28 opens — file early', detail: 'File as early as possible. Earlier filing = more available aid.', link: 'https://studentaid.gov/h/apply-for-aid/fafsa', remind: [7, 1] },
  { id: 'm-scholastic-open', date: '2026-10-01', category: 'scholarship', title: 'Scholastic Art & Writing opens', detail: 'Submit to your regional program. Up to $12,500; bonus value at MECA&D.', link: 'https://www.artandwriting.org/', remind: [14, 7] },
  { id: 'm-youngarts-due', date: '2026-10-15', category: 'scholarship', title: 'YoungArts deadline', detail: 'Submit your discipline work. $250–$10,000.', link: 'https://youngarts.org/apply/', remind: [14, 7, 1] },
  { id: 'm-cocacola-due', date: '2026-10-31', category: 'scholarship', title: 'Coca-Cola Scholars deadline', detail: 'Final submit. $20,000.', link: 'https://www.coca-colascholarsfoundation.org/apply/', remind: [14, 7, 1] },
  { id: 'm-elks-due', date: '2026-11-15', category: 'scholarship', title: 'Elks MVS deadline', detail: 'Final submit with rec letter attached.', link: 'https://www.elks.org/scholars/scholarships/mvs.cfm', remind: [14, 7, 1] },
  { id: 'm-massart-app', date: '2026-12-01', category: 'application', title: 'MassArt application due', detail: 'Portfolio + holistic review. This is the best-fit/affordability pick.', link: 'https://massart.edu/admissions', remind: [30, 14, 7, 1] },
  { id: 'm-meca-app', date: '2026-12-01', category: 'application', title: 'MECA&D application due', detail: 'Merit review — lead with portfolio + leadership/community.', link: 'https://www.meca.edu/admissions/', remind: [30, 14, 7, 1] },
  { id: 'm-scholastic-due', date: '2026-12-15', category: 'scholarship', title: 'Scholastic regional deadline', detail: 'Regional deadlines fall Dec–Jan; confirm YOUR region’s exact date.', link: 'https://www.artandwriting.org/', remind: [14, 7, 1] },

  // ---- Jan–Apr 2027: remaining apps, NHCF, compare offers ----
  { id: 'm-calarts-app', date: '2027-01-05', category: 'application', title: 'CalArts application + portfolio due', detail: 'Program-specific portfolio/audition. Creative reach.', link: 'https://admissions.calarts.edu/', remind: [30, 14, 7, 1] },
  { id: 'm-risd-app', date: '2027-01-15', category: 'application', title: 'RISD application due', detail: 'Portfolio + visual responses + GPA. Aspirational reach.', link: 'https://www.risd.edu/admissions', remind: [30, 14, 7, 1] },
  { id: 'm-nhcf-due', date: '2027-04-09', category: 'scholarship', title: 'NH Charitable Foundation deadline', detail: 'One app opens many NH funds. Needs rec letter.', link: 'https://www.nhcf.org/what-we-offer/support-for-students/apply-for-a-scholarship/', remind: [30, 14, 7, 1] },
  { id: 'm-compare-offers', date: '2027-04-15', category: 'financial', title: 'Compare aid offers & appeal', detail: 'Line up net prices vs. the family guardrails. Appeal where there’s room.', link: '', remind: [14, 7] },
];

// ---------------------------------------------------------------------------
// FAMILY RULES / GUARDRAILS
// ---------------------------------------------------------------------------
export const FAMILY_RULES = {
  parentAnnual: 25000,
  studentAnnual: 10000,
  studentDebtCeiling: 27000,
  savingsTargetLow: 8000,
  savingsTargetHigh: 12000,
  walkAway: 'If a school requires meaningful parent borrowing beyond the planned $25k/yr contribution, it is out — unless the aid package changes materially.',
  defaultPick: 'MassArt',
};

// ---------------------------------------------------------------------------
// MOTIVATION — rotating encouragement. "Her future in her hands."
// ---------------------------------------------------------------------------
export const QUOTES = [
  'Every piece you finish is a brick in the future you’re building. 🎨',
  'You don’t have to be perfect today — just one step closer than yesterday.',
  'Scholarships are just art with a deadline. You’ve got both. 🏆',
  'Future Violet is cheering for the work you do this week.',
  'Talent gets you noticed. Finishing the application gets you in.',
  'Your future is literally in your hands. Make something with it. ✋',
  'Reach schools are reachable. That’s why they’re called reach.',
  'One portfolio piece. One application. One deadline. Repeat. You win.',
];
