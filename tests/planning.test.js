import test from 'node:test';
import assert from 'node:assert/strict';

import { remindersFrom, buildCollegeFundingPlan } from '../shared/planning.js';
import { portfolioEvents, recommendationEvents } from '../shared/userEvents.js';

test('remindersFrom returns the right dated reminders', () => {
  const events = [
    { id: 'a', date: '2026-07-08', remind: [7, 1], title: 'Seven day reminder' },
    { id: 'b', date: '2026-07-02', remind: [7, 1], title: 'One day reminder' },
    { id: 'c', date: '2026-07-20', remind: [7, 1], title: 'No reminder yet' },
    { id: 'd', title: 'Missing date' },
  ];

  const due = remindersFrom(events, new Date('2026-07-01T12:00:00'));
  assert.equal(due.length, 2);
  assert.deepEqual(due.map((e) => e.id), ['a', 'b']);
  assert.deepEqual(due.map((e) => e.days), [7, 1]);
});

test('portfolio and recommendation mappings drop finished items', () => {
  const portfolio = portfolioEvents([
    { id: 'p1', title: 'Piece One', status: 'idea', target: '2026-08-01', medium: 'ink' },
    { id: 'p2', title: 'Piece Two', status: 'final', target: '2026-08-01', medium: 'paint' },
  ]);
  assert.equal(portfolio.length, 1);
  assert.equal(portfolio[0].title, 'Finish piece: Piece One');
  assert.equal(portfolio[0].readonly, true);

  const recs = recommendationEvents([
    { id: 'r1', recommender: 'Ms. Lee', role: 'Art teacher', due: '2026-09-01', status: 'asked' },
    { id: 'r2', recommender: 'Mr. Jones', role: 'Counselor', asked: '2026-08-01', status: 'received' },
  ]);
  assert.equal(recs.length, 1);
  assert.equal(recs[0].title, 'Rec letter needed — Ms. Lee');
  assert.equal(recs[0].readonly, true);
});

test('buildCollegeFundingPlan uses actual aid and scholarship value correctly', () => {
  const college = { id: 'demo', costYear: 20000, avgAidYear: 4000 };
  const scholarships = [
    { id: 'one', name: 'One-time award' },
    { id: 'four', name: 'Renewable award' },
  ];
  const scholarshipStatus = {
    one: { status: 'awarded', amount: 4000, duration: 'one', colleges: [] },
    four: { status: 'awarded', amount: 2000, duration: 'four', colleges: ['demo'] },
  };

  const plan = buildCollegeFundingPlan(college, {
    cash: 4000,
    a529: 8000,
    broker: 40000,
    scholarshipStatus,
    actualAid: 5000,
    familyRules: { parentAnnual: 25000, studentDebtCeiling: 27000 },
    scholarships,
  });

  assert.equal(plan.aidIsActual, true);
  assert.equal(plan.aid, 5000);
  assert.equal(plan.scholYr, 3000);
  assert.equal(plan.a529Yr, 2000);
  assert.equal(plan.cashYr, 1000);
  assert.equal(plan.shortfall, 0);
  assert.equal(plan.debtFree, true);
});
