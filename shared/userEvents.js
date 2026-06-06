// ============================================================================
// Pure (no-React, no-DOM) mappers that turn the things Violet logs herself —
// custom calendar items, volunteer records, and portfolio pieces — into the
// same EVENT shape the built-in milestones use:
//
//   { id, date, category, title, detail, link, remind, ...flags }
//
// Because there's nothing browser-specific in here, BOTH sides import it:
//   • the browser (via src/lib/util.js) → Calendar, Roadmap, .ics download
//   • the server (api/calendar.ics.js feed + api/send-reminders.js email cron)
//
// Keeping the conversion in one file is what finally lets the live feed and the
// daily reminder email "see" her own items, not just the built-in roadmap.
// ============================================================================

// ---- Volunteer record → event ----------------------------------------------
export function volunteerToEvent(v) {
  const bits = [];
  if (v.hours) bits.push(`${v.hours} hr${Number(v.hours) === 1 ? '' : 's'}`);
  if (v.ongoing) bits.push('ongoing');
  if (v.description) bits.push(v.description);
  return {
    id: v.id,
    date: v.date || '',
    category: 'volunteer',
    title: v.role ? `${v.role} — ${v.org}` : (v.org || 'Volunteer work'),
    detail: bits.join(' · '),
    link: v.link || '',
    volunteer: true,
  };
}

// ---- Portfolio piece → event ------------------------------------------------
// A piece with a Target date becomes a dated "Finish piece" reminder. It carries
// the same 7-day / 1-day reminder window as a custom event, so it both shows on
// the Calendar/Roadmap AND triggers the email. It is intentionally `readonly`
// and NOT a checkable milestone — its real status lives on the Portfolio tab and
// it is never counted in any progress % (the mountain + dashboard stay built-in
// milestones only).
export function portfolioToEvent(p) {
  const bits = [];
  if (p.medium) bits.push(p.medium);
  bits.push(`Status: ${p.status || 'idea'}`);
  if (p.notes) bits.push(p.notes);
  return {
    id: `pf-${p.id}`,
    date: p.target || '',
    category: 'portfolio',
    title: `Finish piece: ${p.title}`,
    detail: bits.join(' · '),
    link: '',
    remind: [7, 1],
    portfolio: true,
    readonly: true,
  };
}

// ---- Recommendation letter → event(s) ---------------------------------------
// A recommender record carries two dates worth tracking: when Violet ASKED, and
// when the letter is NEEDED BY. Each becomes its own dated, `readonly` reminder
// (same 7-day / 1-day window as everything else) so both show on the Calendar +
// Roadmap and trigger the email. They never count toward any progress %. Once a
// letter is in hand (status received/submitted) its reminders drop off — like a
// portfolio piece marked "final".
const REC_DONE = ['received', 'submitted'];

export function recommendationToEvents(r) {
  if (!r || REC_DONE.includes(r.status)) return [];
  const who = r.recommender || 'recommender';
  const meta = [r.role, r.schools && `Schools: ${r.schools}`, r.notes]
    .filter(Boolean)
    .join(' · ');
  const out = [];
  if (r.asked) {
    out.push({
      id: `rec-asked-${r.id}`,
      date: r.asked,
      category: 'recommend',
      title: `Asked ${who} for a rec letter`,
      detail: meta,
      link: '',
      remind: [7, 1],
      recommendation: true,
      readonly: true,
    });
  }
  if (r.due) {
    out.push({
      id: `rec-due-${r.id}`,
      date: r.due,
      category: 'recommend',
      title: `Rec letter needed — ${who}`,
      detail: meta,
      link: '',
      remind: [7, 1],
      recommendation: true,
      readonly: true,
    });
  }
  return out;
}

// ---- Bulk helpers (used by the server feed + email cron) --------------------

// Custom items already match the event shape; just drop dateless ones and make
// sure each has a reminder window (older items may predate the default).
export function customEvents(items = []) {
  return (items || [])
    .filter((c) => c && c.date)
    .map((c) => ({ remind: [7, 1], ...c }));
}

export function volunteerEvents(items = []) {
  return (items || []).map(volunteerToEvent).filter((e) => e.date);
}

// Only pieces that have a target date and aren't already finished — once she
// marks a piece "final" on the Portfolio tab, its reminder drops off everywhere.
export function portfolioEvents(items = []) {
  return (items || [])
    .filter((p) => p && p.target && p.status !== 'final')
    .map(portfolioToEvent);
}

// Every recommender record → its (up to two) dated reminders. Letters already
// received/submitted produce none, so they drop off the calendar + email.
export function recommendationEvents(items = []) {
  return (items || []).flatMap(recommendationToEvents);
}
