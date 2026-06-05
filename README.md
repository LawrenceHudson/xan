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
| 🏠 Dashboard | % complete, overdue items, next 30 days, current best-fit school, plus a **Creative momentum** row (portfolio finals, achievements, writing pieces, volunteer hours, savings) |
| 💌 From Dad | A personal letter to Violet about why this is a many-options plan; text lives in `DAD_NOTE` in `shared/roadmap.js` |
| 🛣️ Roadmap | Full chronological timeline; check things off live |
| 📅 Calendar | Month grid; tap any event for details + links |
| ✅ Checklist | Filter by category, hide-done, big progress bar |
| 🎨 Portfolio | Piece-by-piece tracker: idea → in-progress → revise → final, tagged by school + scholarship, with notes and target dates |
| 🖼️ Gallery | A SlideRoom-style wall to review finished pieces (with image links) before uploading |
| ✍️ Writing | Collect stories, poems, plays, D&D campaigns, and **college essays**; live word counter, per-school essay prompts + word limits, ⭐ favorites, and per-piece TXT export |
| 🏅 Achievements | Log awards, exhibitions, sales, publications & more; **link an image** and click the thumbnail to view it full-size; add/edit/delete and **export the whole list as a TXT file** |
| 🤝 Volunteer | Track service hours (org, role, hours, ongoing); entries also surface on the **Checklist** |
| 📄 Résumé | Friendly writing tips + two upload/download slots (an **art-focused** and a **young-career** résumé), stored in the browser |
| 📜 Recommendations | Track each recommender (role, which schools, status, asked/needed-by dates, notes) and **store the finished letter file** so it's ready to attach to any application |
| 🏆 Scholarships | When to start, the deliverable, the deadline, the link |
| 🎓 Colleges | Where/when to apply, what each values, **total price + avg aid + avg net price + Net Price Calculator link**, affordability + **Family Rules** |
| 📬 Decisions | Per-school status (planning → applied → accepted/waitlist/denied → committed), award + net price log, and a **May 1 Decision Day** countdown |
| 🐖 Savings | Log deposits/scholarship wins toward the $8k–$12k goal |
| 🛠️ Admin | App version, **release notes**, a **Send test email** button, and a **Bug / Feature submitter** (log items and clear them when handled) |

**Login screen** doubles as a **529 gifting splash** — family & friends get a short
pitch and a direct link to contribute to Violet's college-savings account (edit
the copy in `GIFTING` in `shared/roadmap.js`).

**Custom items:** on the **Calendar** she can add her own events (and remove them);
these flow into the Checklist too. **Light/dark mode** toggles from the ☀️/🌙
button in the top bar and is remembered between visits.

**Versioning:** every change to the app bumps `APP_VERSION` and adds a release
note in [`shared/version.js`](shared/version.js); both show on the **Admin** tab
and the app footer.

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
3. The **xanderr.com** domain is verified in Resend, so reminders send from
   `nick.cage@xanderr.com`. (For quick testing you can fall back to
   `onboarding@resend.dev`.)

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
- **Campus visit dates** — the four visit milestones use placeholder dates; book official tours and replace them
- **National Portfolio Day** — Boston is confirmed **Nov 1, 2026** (Hynes Center); the full 2026–27 schedule is still being posted at nationalportfolioday.org, so check for other nearby dates
- **School costs & aid** — total price, average aid, and average net price are recent published *estimates*. Always run each school's **Net Price Calculator** for your real number. For MassArt, the NH **New England Regional** tuition rate is the key advantage — the calculator will show it.

---

*Your future, in your hands. ✨*
