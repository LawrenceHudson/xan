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
export const COLLEGE_LAST_VERIFIED = '2026-06-25';

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
  visit:       { label: 'Campus Visit',   color: '#14b8a6', emoji: '🏫' },
  decision:    { label: 'Decision Day',   color: '#ef4444', emoji: '📬' },
  volunteer:   { label: 'Volunteer',      color: '#0891b2', emoji: '🤝' },
  custom:      { label: 'Custom',         color: '#8b5cf6', emoji: '📌' },
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
    npcLink: 'https://npc.collegeboard.org/app/massart',
    totalPrice: '~$66,920/yr (out-of-state sticker)',
    costYear: 66920,
    avgAidYear: 14366,
    costNote: 'Violet is an NH resident → eligible for the New England Regional Tuition rate, which cuts tuition well below the out-of-state sticker. This is the family’s single biggest cost advantage — confirm the exact NE-regional figure in the Net Price Calculator.',
    avgAid: 'Avg need grant ~$10,433/yr · avg merit ~$3,933/yr',
    netPrice: '~$24,159/yr (overall avg net price)',
    visitDate: '2026-09-26',
    source: 'MassArt admissions + MassArt net price calculator',
    lastVerified: COLLEGE_LAST_VERIFIED,
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
    npcLink: 'https://www.meca.edu/admissions/tuition-financial-aid/net-price-calculator/',
    totalPrice: '~$67,215/yr (COA; tuition+fees ~$44,760)',
    costYear: 67215,
    avgAidYear: 20651,
    costNote: '100% of students receive aid. First-year merit scholarships commonly land ~$15k–$23k; Scholastic Art Award wins add extra value here.',
    avgAid: 'Avg aid package ~$20,277–$21,026/yr',
    netPrice: '~$35,395–$39,639/yr (avg net price)',
    visitDate: '2026-10-17',
    source: 'MECA&D admissions + MECA&D tuition/net price calculator',
    lastVerified: COLLEGE_LAST_VERIFIED,
    verify: true,
  },
  {
    id: 'risd',
    name: 'RISD (Rhode Island School of Design)',
    tier: 'reach',
    rank: 4,
    accept: '~14–19%',
    values: 'Strongest indicators are portfolio work, the visual responses, and GPA. Test-optional. Institutional funding is primarily NEED-based, not broad automatic merit.',
    link: 'https://www.risd.edu/admissions',
    appDeadline: '2027-01-15',
    aidDeadline: '2027-02-01',
    affordability: 'Aspirational reach. Expensive even with decent aid. Do NOT build the financial plan around RISD — only pursue if the real net price lands within the family guardrails.',
    npcLink: 'https://risd.clearcostcalculator.com/student',
    totalPrice: '~$93,776/yr (2026–27 COA; tuition ~$66,460)',
    costYear: 93776,
    avgAidYear: 41993,
    costNote: 'Institutional funding is primarily NEED-based — requires the CSS Profile in addition to FAFSA. Aid materials due ~Feb 15. Run the NPC before committing time.',
    avgAid: 'Avg aid package ~$41,993/yr',
    netPrice: '~$42,106/yr (avg net price)',
    visitDate: '2026-11-07',
    source: 'RISD admissions + RISD clear cost calculator',
    lastVerified: COLLEGE_LAST_VERIFIED,
    verify: true,
  },
  {
    id: 'calarts',
    name: 'CalArts (California Institute of the Arts)',
    tier: 'reach',
    rank: 5,
    accept: 'Reach / portfolio-driven',
    values: 'Program-specific portfolio or audition required. Auto-considered for merit scholarships based on artistic + academic potential, originality, and strength of work. Merit starts at $10k/yr (limited, competitive).',
    link: 'https://admissions.calarts.edu/',
    appDeadline: '2027-01-05',
    aidDeadline: '2027-02-01',
    affordability: 'Riskiest financially under the current plan. Treat as a creative reach, not a financial base case.',
    npcLink: 'https://calarts.edu/admissions-aid/tuition/net-price-calculator',
    totalPrice: '~$81,346/yr (COA; tuition ~$58,996–$61,359)',
    costYear: 81346,
    avgAidYear: 28420,
    costNote: 'Cross-country travel adds real cost on top of the sticker. Merit starts at ~$10k/yr but is limited and competitive. Highest net price of the four.',
    avgAid: 'Avg aid package ~$28,420/yr',
    netPrice: '~$47,183–$55,225/yr (avg net price)',
    visitDate: '2026-10-10',
    source: 'CalArts admissions + CalArts net price calculator',
    lastVerified: COLLEGE_LAST_VERIFIED,
    verify: true,
  },
  {
    id: 'uc-daap-art',
    name: 'UC DAAP School of Art (University of Cincinnati)',
    tier: 'target',
    rank: 3,
    accept: 'Competitive / selective',
    values: 'Holistic review with a studio-art focus. The School of Art says students work across a cross-media curriculum, learn from internationally recognized faculty and visiting artists, and get 3 semesters of experiential learning or co-op. DAAP first-year scholarships are reviewed for eligible students, and one School of Art award is portfolio-based for entering BFA students.',
    link: 'https://www.daap.uc.edu/prospective-students/admissions/undergrad-admissions.html',
    appDeadline: '2026-11-01',
    aidDeadline: '2026-12-01',
    affordability: "Strong public-school value. UC's 2026-27 non-resident tuition is $29,728 per year, and the official on-campus COA budget for a typical new Ohio resident is $43,276. DAAP scholarship review starts with completed applications by Nov. 1, and UC says scholarship-assistance applicants should have a complete admission application in by Dec. 1.",
    npcLink: 'https://www.uc.edu/about/financial-aid/tools-resources/net-price-calculator.html',
    totalPrice: '~$59,610/yr (inferred 2026-27 non-resident on-campus COA)',
    costYear: 59610,
    avgAidYear: 1500,
    avgAid: 'DAAP scholarships are need/merit-based; UC cost example uses $1,500/yr in scholarship earnings',
    netPrice: '~$58,110/yr (sample estimate after $1,500 scholarship earnings)',
    source: 'UC DAAP admissions + UC cost page + UC net price calculator',
    lastVerified: COLLEGE_LAST_VERIFIED,
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
  { id: 'm-meca-precollege-start', date: '2026-07-10', category: 'portfolio', title: 'MECA&D Pre-College 3-week build begins', detail: 'Violet is enrolled! 3-week intensive (Jul 10–31). Treat every piece you make here as potential portfolio + scholarship material — photograph and log each one in the Portfolio tab.', link: 'https://www.meca.edu/pre-college/', remind: [14, 7, 1] },
  { id: 'm-meca-precollege-end', date: '2026-07-31', category: 'portfolio', title: 'MECA&D Pre-College ends — log every piece', detail: 'Wrap-up: pick your 3–4 strongest pieces from the program for YoungArts + early apps. Add them to the Gallery and tag school/scholarship fit.', link: 'https://www.meca.edu/pre-college/', remind: [3, 1] },
  { id: 'm-portfolio-summer', date: '2026-08-15', category: 'portfolio', title: 'Finalize 3–4 strong portfolio pieces', detail: 'Lock in your best work for YoungArts + early apps. Quality over quantity.', link: '', remind: [14, 7, 1] },
  { id: 'm-savings-goal', date: '2026-07-01', category: 'savings', title: 'Set savings goal & start tracking', detail: 'Target $8k–$12k by Fall 2027 (~$533–$800/mo). Log monthly progress in the Savings tab.', link: '', remind: [7] },
  { id: 'm-youngarts-prep', date: '2026-08-01', category: 'scholarship', title: 'Prep YoungArts submission', detail: 'YoungArts opens ~Summer 2026. Get your portfolio pieces submission-ready.', link: 'https://youngarts.org/apply/', remind: [14, 7] },

  // ---- Aug–Sep 2026: scholarships open + rec letters ----
  { id: 'm-elks-open', date: '2026-08-01', category: 'scholarship', title: 'Elks MVS opens — start application', detail: 'Portable to any 4-yr U.S. college. Needs a recommendation letter.', link: 'https://www.elks.org/scholars/scholarships/mvs.cfm', remind: [7, 1] },
  { id: 'm-cocacola-open', date: '2026-08-03', category: 'scholarship', title: 'Coca-Cola Scholars opens — apply', detail: '$20,000, school-agnostic, highly portable.', link: 'https://www.coca-colascholarsfoundation.org/apply/', remind: [7, 1] },
  { id: 'm-rec-requests', date: '2026-09-15', category: 'recommend', title: 'Ask teachers for recommendation letters', detail: 'Give recommenders 4+ weeks. Needed for Elks, NHCF, and several college apps.', link: '', remind: [14, 7] },

  // ---- Required campus visits (one per school) — confirm/booking dates ----
  { id: 'm-visit-massart', date: '2026-09-26', category: 'visit', title: 'Schedule + take MassArt tour (Boston) — required', detail: 'Best-fit/affordability pick — see it before applying. Register for an official in-person tour (a campus visit also earns an application-fee waiver). Confirm a date that works for the family.', link: 'https://admissions.massart.edu/portal/ug_tours', remind: [14, 7, 1] },
  { id: 'm-visit-calarts', date: '2026-10-10', category: 'visit', title: 'Schedule + take CalArts tour (Valencia, CA)', detail: 'Cross-country — pre-registration is required (no self-guided tours). Plan travel early, or register for an official virtual tour if an in-person trip isn’t feasible. Creative reach.', link: 'https://apply.calarts.edu/portal/campustours', remind: [30, 14, 7] },
  { id: 'm-visit-meca', date: '2026-10-17', category: 'visit', title: 'Schedule + take MECA&D tour (Portland, ME)', detail: 'Easy New England drive — Violet already knows the building from Pre-College. Register for an official admissions tour so it counts as demonstrated interest.', link: 'https://apply.meca.edu/portal/campus-tours', remind: [14, 7, 1] },
  { id: 'm-visit-risd', date: '2026-11-07', category: 'visit', title: 'Schedule + take RISD tour (Providence, RI)', detail: 'Aspirational reach. Register for an official tour and pair it with a Providence trip. Confirm a date.', link: 'https://admissions.risd.edu/portal/undergrad-events', remind: [14, 7, 1] },

  // ---- National Portfolio Day (free portfolio reviews from all 4 schools in one room) ----
  { id: 'm-npd-boston', date: '2026-11-01', category: 'portfolio', title: 'National Portfolio Day — Boston (Hynes Center)', detail: 'FREE portfolio reviews with admissions reps & faculty from art schools nationwide — MassArt, MECA&D, RISD, CalArts typically all attend. Bring your best 10–15 pieces. Closest NPD to NH. Register when the 2026–27 season opens; full schedule is still being posted.', link: 'https://nationalportfolioday.org/schedule/', remind: [30, 14, 7, 1] },

  // ---- Oct–Dec 2026: FAFSA, Scholastic, college apps ----
  { id: 'm-fafsa-open', date: '2026-10-01', category: 'financial', title: 'FAFSA 2027–28 opens — file early', detail: 'File as early as possible. Earlier filing = more available aid.', link: 'https://studentaid.gov/h/apply-for-aid/fafsa', remind: [7, 1] },
  { id: 'm-scholastic-open', date: '2026-10-01', category: 'scholarship', title: 'Scholastic Art & Writing opens', detail: 'Submit to your regional program. Up to $12,500; bonus value at MECA&D.', link: 'https://www.artandwriting.org/', remind: [14, 7] },
  { id: 'm-youngarts-due', date: '2026-10-15', category: 'scholarship', title: 'YoungArts deadline', detail: 'Submit your discipline work. $250–$10,000.', link: 'https://youngarts.org/apply/', remind: [14, 7, 1] },
  { id: 'm-cocacola-due', date: '2026-10-31', category: 'scholarship', title: 'Coca-Cola Scholars deadline', detail: 'Final submit. $20,000.', link: 'https://www.coca-colascholarsfoundation.org/apply/', remind: [14, 7, 1] },
  { id: 'm-elks-due', date: '2026-11-15', category: 'scholarship', title: 'Elks MVS deadline', detail: 'Final submit with rec letter attached.', link: 'https://www.elks.org/scholars/scholarships/mvs.cfm', remind: [14, 7, 1] },
  { id: 'm-uc-daap-app', date: '2026-11-01', category: 'application', title: 'UC DAAP School of Art application due', detail: 'DAAP scholarship review starts with completed applications by Nov. 1. UC says scholarship-assistance applicants should have a complete admission application in by Dec. 1.', link: 'https://www.daap.uc.edu/prospective-students/admissions/undergrad-admissions.html', remind: [30, 14, 7, 1] },
  { id: 'm-massart-app', date: '2026-12-01', category: 'application', title: 'MassArt application due', detail: 'Portfolio + holistic review. This is the best-fit/affordability pick.', link: 'https://massart.edu/admissions', remind: [30, 14, 7, 1] },
  { id: 'm-meca-app', date: '2026-12-01', category: 'application', title: 'MECA&D application due', detail: 'Merit review — lead with portfolio + leadership/community.', link: 'https://www.meca.edu/admissions/', remind: [30, 14, 7, 1] },
  { id: 'm-scholastic-due', date: '2026-12-15', category: 'scholarship', title: 'Scholastic regional deadline', detail: 'Regional deadlines fall Dec–Jan; confirm YOUR region’s exact date.', link: 'https://www.artandwriting.org/', remind: [14, 7, 1] },

  // ---- Jan–Apr 2027: remaining apps, NHCF, compare offers ----
  { id: 'm-calarts-app', date: '2027-01-05', category: 'application', title: 'CalArts application + portfolio due', detail: 'Program-specific portfolio/audition. Creative reach.', link: 'https://admissions.calarts.edu/', remind: [30, 14, 7, 1] },
  { id: 'm-risd-app', date: '2027-01-15', category: 'application', title: 'RISD application due', detail: 'Portfolio + visual responses + GPA. Aspirational reach.', link: 'https://www.risd.edu/admissions', remind: [30, 14, 7, 1] },
  { id: 'm-nhcf-due', date: '2027-04-09', category: 'scholarship', title: 'NH Charitable Foundation deadline', detail: 'One app opens many NH funds. Needs rec letter.', link: 'https://www.nhcf.org/what-we-offer/support-for-students/apply-for-a-scholarship/', remind: [30, 14, 7, 1] },
  { id: 'm-compare-offers', date: '2027-04-15', category: 'financial', title: 'Compare aid offers & appeal', detail: 'Line up net prices vs. the family guardrails. Appeal where there’s room.', link: '', remind: [14, 7] },

  // ---- THE BIG DAY ----
  { id: 'm-decision-day', date: '2027-05-01', category: 'decision', title: '🎉 Decision Day — commit & pay enrollment deposit', detail: 'National College Decision Day. Pick the school, submit the enrollment deposit, and decline the others. Make the final choice against the family guardrails. This is the finish line of the whole roadmap — you earned it.', link: '', remind: [30, 14, 7, 1] },
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

// ---------------------------------------------------------------------------
// PORTFOLIO — guidance for the piece-by-piece tracker + gallery.
// ---------------------------------------------------------------------------
export const PORTFOLIO = {
  // Most art schools want a focused, strong body of work. Aim for the high end
  // so you can curate down per school. Confirm each school's exact requirement.
  targetPieces: 15,
  pieceStatuses: ['idea', 'in-progress', 'revise', 'final'],
  slideroom: {
    link: 'https://www.slideroom.com/',
    note: 'SlideRoom is the platform most art schools use to receive your portfolio. Many colleges link their SlideRoom submission from the application portal. Use the Gallery tab here to review your finished pieces before you upload them.',
  },
  tips: [
    'Show range: observational drawing, color work, and at least one personal/conceptual project.',
    'Schools want to see your thinking — include 1–2 process or sketchbook pieces, not just polished finals.',
    'Photograph work in even, natural light against a clean background. Bad photos sink good art.',
    'Curate per school: lead with your strongest 3 pieces. You don’t have to submit the same set everywhere.',
  ],
};

// ---------------------------------------------------------------------------
// ACHIEVEMENTS — categories for the big-wins tracker.
// ---------------------------------------------------------------------------
export const ACHIEVEMENT_CATEGORIES = {
  award:       { label: 'Award / Honor',        emoji: '🏆', color: '#f59e0b' },
  exhibition:  { label: 'Exhibition / Show',    emoji: '🖼️', color: '#7c3aed' },
  sale:        { label: 'Sale / Commission',    emoji: '💰', color: '#22c55e' },
  publication: { label: 'Publication',          emoji: '📚', color: '#0ea5e9' },
  academic:    { label: 'Academic',             emoji: '🎓', color: '#6366f1' },
  project:     { label: 'Creative Project',     emoji: '🎨', color: '#ec4899' },
  leadership:  { label: 'Leadership',           emoji: '👥', color: '#14b8a6' },
  press:       { label: 'Press / Recognition',  emoji: '📣', color: '#ef4444' },
};

// A couple of seeds so the page isn't empty the first time — Violet can edit
// or delete these. (These are real wins Loren mentioned.)
export const ACHIEVEMENT_SEEDS = [
  { category: 'award',     title: 'Won the Art 2026 award',            venue: '',               date: '2026-01-01', description: 'Recognized for outstanding studio work.', link: '', image: '' },
  { category: 'sale',      title: 'Sold a piece at the AVA Gallery',   venue: 'AVA Gallery',    date: '',           description: 'First gallery sale.',                    link: '', image: '' },
  { category: 'publication', title: 'Illustrated a book',              venue: '',               date: '',           description: 'Provided illustrations for a published book.', link: '', image: '' },
];

// ---------------------------------------------------------------------------
// RESUME — friendly guidance + the two résumé "slots" the upload tab manages.
// ---------------------------------------------------------------------------
export const RESUME_GUIDE = {
  slots: [
    {
      id: 'art',
      label: 'Art Résumé',
      emoji: '🎨',
      blurb: 'A one-page snapshot of you AS AN ARTIST. Art schools and gallery/portfolio reviewers read this.',
      include: [
        'Exhibitions & shows (where, what, when) — group shows count.',
        'Awards & honors (Scholastic, YoungArts, school prizes, the Art 2026 award).',
        'Sales & commissions (e.g., the AVA Gallery piece) and any published/illustrated work.',
        'Training: pre-college programs (MECA&D summer), workshops, notable classes.',
        'Skills & media: drawing, painting, digital, printmaking, software (Procreate, Photoshop).',
      ],
    },
    {
      id: 'career',
      label: 'Young-Career Résumé',
      emoji: '💼',
      blurb: 'A traditional one-page résumé for jobs, scholarships, and general applications.',
      include: [
        'Contact line: name, town, email, phone (keep it simple and professional).',
        'Education: high school, expected graduation, GPA if it helps you.',
        'Experience: jobs, internships, babysitting/tutoring — anything with responsibility.',
        'Volunteer & activities: pull straight from the Volunteer tab.',
        'Awards, skills, and interests to round it out.',
      ],
    },
  ],
  tips: [
    'Keep it to ONE page. Reviewers skim — make the top third count.',
    'Lead with strong verbs: “Exhibited,” “Illustrated,” “Organized,” “Sold,” “Led.”',
    'Be specific with numbers: “Sold 3 pieces,” “Volunteered 40+ hours,” “Group show of 12 artists.”',
    'Save and submit as a PDF so the formatting never breaks.',
    'Update it whenever you add a win to the Achievements tab — then re-upload here.',
  ],
  // Browser size guard for the upload (DataURL in localStorage).
  maxBytes: 1.5 * 1024 * 1024,
};

// ---------------------------------------------------------------------------
// VOLUNTEER — light guidance for the service-hours tracker.
// ---------------------------------------------------------------------------
export const VOLUNTEER_GUIDE = {
  intro: 'Colleges like to see genuine, sustained service — depth beats a long random list. Aim for a couple of things you actually care about and stick with them.',
  tips: [
    'Quality over quantity: 1–2 ongoing commitments look stronger than ten one-offs.',
    'Art-adjacent service is gold — teaching a kids’ art class, painting a mural, helping at a gallery.',
    'Log hours as you go; it’s nearly impossible to reconstruct later.',
    'Anything you log here can flow onto your Young-Career résumé.',
  ],
};

// ---------------------------------------------------------------------------
// A NOTE FROM DAD — shown on its own tab. Edit the words here anytime.
// Wrap text in **double asterisks** to make it bold, *single* for italics.
// ---------------------------------------------------------------------------
export const DAD_NOTE = {
  greeting: 'Hey kiddo,',
  signoff: 'Love, Dad',
  paragraphs: [
    "I want you to know something important about this plan: **it is not a RISD-only plan.** It is a **many-options plan**.",
    "The work you’re doing now — building your portfolio, keeping strong grades, saving money, applying for scholarships, and putting your applications together early — helps you no matter where you end up. It helps at RISD, but it also helps at **MECA&D, MassArt, and CalArts**. Those schools all care a lot about artistic potential, and in different ways they all use your portfolio, your application quality, and your overall preparation to decide both admission and aid.",
    "Some of the things you’re applying for are **portable**, which means they help no matter which school you choose. **YoungArts** is a national arts competition with cash awards between **$250 and $10,000**; that recognition belongs to *you*, not one school. **Scholastic Art & Writing** is also national, and National Medalists are eligible for scholarships of up to **$12,500**; again, that recognition follows *you*. **Coca-Cola Scholars** is tied to attending an accredited U.S. college, not one specific school. **Elks Most Valuable Student** is also tied to attending a four-year accredited U.S. college, not one particular campus. **NH Charitable Foundation** is built to support New Hampshire students broadly, not just students attending one school in one state.",
    "That means if you work hard on this plan and later decide that RISD is not the best fit financially, or artistically, or personally, that work is **not wasted**. It still makes you a stronger applicant. It still gives you more options. It still gives you a better shot at scholarships. It still gives you more control over your future.",
    "In fact, some schools may reward this work even more directly. **MECA&D** gives incoming first-year scholarships ranging from **$15,000 to $23,000**, and it specifically gives extra renewable scholarships to students who won **Scholastic Art Awards**. **CalArts** says all admitted students are considered for merit scholarships, and that merit is driven first by the admissions **portfolio or audition**. **MassArt** says all applicants are automatically reviewed for merit scholarships, and its cost page notes that actual cost can vary based in part on the **portfolio score** received at admission. RISD, by contrast, is more heavily driven by **need-based institutional aid**, though it also has a specific YoungArts-related scholarship path for two domestic first-year students.",
    "So the real win here is not just “getting into RISD.” The real win is becoming the kind of applicant who has **strong choices**. A strong portfolio, strong habits, and smart scholarship work can give you choices about where you go, how much debt you take on, and what kind of start you have as an artist. That is the point of the plan.",
  ],
};

// ---------------------------------------------------------------------------
// WRITING — Violet is a strong writer (stories, poems, plays, D&D campaigns)
// AND this is where she keeps her college essays. Categories keep it sortable.
// ---------------------------------------------------------------------------
export const WRITING_CATEGORIES = {
  story:  { label: 'Story',         emoji: '📖', color: '#7c3aed' },
  poem:   { label: 'Poem',          emoji: '🪶', color: '#ec4899' },
  play:   { label: 'Play / Script', emoji: '🎭', color: '#f59e0b' },
  dnd:    { label: 'D&D Campaign',  emoji: '🐉', color: '#16a34a' },
  essay:  { label: 'College Essay', emoji: '🎓', color: '#0ea5e9' },
  other:  { label: 'Other',         emoji: '✍️', color: '#6366f1' },
};

export const WRITING_GUIDE = {
  intro:
    'A home for your writing — stories, poems, plays, D&D campaigns — and the place to draft and save your college essays. Mark a favorite with a ⭐ to feature it.',
  // Status flow mirrors the portfolio: an idea → drafting → revising → done.
  statuses: [
    { id: 'idea',     label: 'Idea',     emoji: '💡' },
    { id: 'drafting', label: 'Drafting', emoji: '✏️' },
    { id: 'revising', label: 'Revising', emoji: '🔁' },
    { id: 'final',    label: 'Final',    emoji: '✅' },
  ],
  tips: [
    'Paste or write directly in the body box — it saves to this browser automatically.',
    'For college essays, fill in the school + prompt + word limit so you can tailor each one.',
    'The word counter is live — most college essays cap around 500–650 words.',
    'Star (⭐) the pieces you’re proudest of; they rise to the top of the list.',
    'Use “Download .txt” to back a piece up or move it into an application portal.',
  ],
  // Common college-essay word limits, for the quick-pick on the essay form.
  essayLimits: [150, 250, 350, 500, 650],
};

// ---------------------------------------------------------------------------
// RECOMMENDATIONS — track each recommender AND store the letter file itself.
// ---------------------------------------------------------------------------
export const RECOMMENDATIONS_GUIDE = {
  intro:
    'Letters of recommendation in one place — track who you asked, where each letter is going, and store the finished letter so it’s ready whenever an application needs it.',
  statuses: [
    { id: 'asked',      label: 'Asked',        emoji: '✉️' },
    { id: 'inprogress', label: 'In progress',  emoji: '⏳' },
    { id: 'received',   label: 'Received',     emoji: '✅' },
    { id: 'submitted',  label: 'Submitted',    emoji: '📨' },
  ],
  tips: [
    'Most art schools want 1–2 letters. An art teacher who knows your work is gold.',
    'Mix it up: one from an art teacher, one from an academic teacher or counselor.',
    'Ask at least 3–4 weeks before the deadline — give recommenders time to do it well.',
    'Give each recommender your résumé, a few portfolio images, and the due date.',
    'Send a thank-you note after — and let them know where you got in. 💜',
    'Keep a saved copy of each letter here so a “general” letter is always ready to attach.',
  ],
  // Browser size guard for the upload (DataURL in localStorage).
  maxBytes: 1.5 * 1024 * 1024,
};

// ---------------------------------------------------------------------------
// 529 GIFTING — splash shown on the login page. ORIGINAL copy; the link points
// to the family's Fidelity gifting page. Edit the words here anytime.
// ---------------------------------------------------------------------------
export const GIFTING = {
  url: 'https://digital.fidelity.com/prgw/digital/familygifting/mlgLandingPage?uuid=f374fc804cbe428b939e573d998ee299',
  headline: 'Help Violet get to art school 🎨',
  blurb:
    'Birthdays, holidays, “just because” — instead of one more thing to dust, you can give something that compounds: a contribution to Violet’s 529 college-savings account. Every dollar goes straight toward tuition, supplies, and chasing the dream.',
  bullets: [
    'Quick & secure — give in a couple of minutes through Fidelity.',
    'No account or login required to send a gift.',
    'Any amount helps and grows tax-advantaged until she’s in school.',
  ],
  cta: 'Open the gifting page ↗',
};
