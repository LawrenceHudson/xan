# 🎨 Violet's Art School Roadmap

An interactive planning app for Violet's art-school journey (Fall 2027): a live
**roadmap/timeline**, **calendar**, progress **checklist**, **scholarship** and
**college** trackers, a **savings** tracker, and **automatic email reminders**
sent **1 week before** every milestone (and 1 day before deadlines).

Built with **React + Vite**, deployed free on **Vercel**, with reminder emails
sent via **Resend** on a daily **Vercel Cron** schedule.

---

## What's inside

| Tab | What it does |
|-----|--------------|
| 🏠 Dashboard | % complete, overdue items, next 30 days, current best-fit school |
| 🛣️ Roadmap | Full chronological timeline; check things off live |
| 📅 Calendar | Month grid; tap any event for details + links |
| ✅ Checklist | Filter by category, hide-done, big progress bar |
| 🏆 Scholarships | When to start, the deliverable, the deadline, the link |
| 🎓 Colleges | Where/when to apply, what each school values, affordability + **Family Rules** |
| 🐖 Savings | Log deposits/scholarship wins toward the $8k–$12k goal |

**One source of truth:** every date, school, scholarship, and rule lives in
[`shared/roadmap.js`](shared/roadmap.js). Edit that file and the whole app +
the email reminders update automatically.

---

## 1) Run it locally

```bash
npm install
cp .env.example .env          # then edit .env
npm run dev                    # open http://localhost:5173
```

Login password is `xandoesart` (change it with `VITE_APP_PASSWORD` in `.env`).
> Heads-up: a front-end password is a friendly gate, not real security — anyone
> with the link/code can see it. Fine for a private family tool; don't store
> secrets behind it.

Test which reminders would fire today (and actually send if a Resend key is set):

```bash
npm run reminders:test
```

---

## 2) Get a free Resend key (for the reminder emails)

1. Sign up at **https://resend.com** (free tier: 3,000 emails/month).
2. Copy an **API key**.
3. For quick testing you can send from `onboarding@resend.dev`. For real use,
   add and **verify your own domain** in Resend, then send from e.g.
   `roadmap@yourdomain.com`.

---

## 3) Deploy to Vercel (free) + turn on reminders

1. Push this folder to a GitHub repo.
2. At **https://vercel.com** → **Add New Project** → import the repo → Deploy.
3. In **Project → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` = your Resend key
   - `REMINDER_FROM` = `Violet's Roadmap <onboarding@resend.dev>` (or your domain)
   - `REMINDER_TO` = `violet@…, loren@…, bri@…` (comma-separated)
   - `CRON_SECRET` = any long random string (optional but recommended)
   - `VITE_APP_PASSWORD` = `xandoesart` (or your own)
4. **Redeploy** so the variables take effect.

`vercel.json` already schedules the job daily at **13:00 UTC (9:00 AM ET)**:
```json
{ "crons": [ { "path": "/api/send-reminders", "schedule": "0 13 * * *" } ] }
```
Each day it emails any milestone whose reminder window (e.g. 7 days before) lands
on that date. Change the `remind: [...]` array on any event in `shared/roadmap.js`
to adjust how far ahead it warns.

> Vercel's Hobby (free) plan runs Cron **once per day**, which is exactly what
> this needs.

---

## 4) Make it yours

- **Add/edit milestones, scholarships, colleges** → `shared/roadmap.js`
- **Change reminder timing** → the `remind: [30, 14, 7, 1]` array per event
- **Recipients** → `REMINDER_TO` env var
- **Reuse for the other daughters later** → copy the repo, edit `STUDENT` and the
  data in `shared/roadmap.js`

---

## ⚠️ Dates to confirm before relying on them

The sample dates came from a planning brief and are marked `verify: true` in the
data (the app shows a **"Verify date"** badge). Confirm each on the official site
before trusting the reminder:

- YoungArts open/close window
- Scholastic Art & Writing — **your region's** exact deadline (Dec–Jan varies)
- Coca-Cola Scholars open/close
- Elks MVS open/close
- NH Charitable Foundation open/close
- FAFSA 2027–28 open date
- MassArt / MECA&D / RISD / CalArts application + aid deadlines

---

*Your future, in your hands. ✨*
