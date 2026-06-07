import { useState, useEffect } from 'react';
import PublicGallery from './components/PublicGallery.jsx';
import Dashboard from './components/Dashboard.jsx';
import Timeline from './components/Timeline.jsx';
import CalendarView from './components/CalendarView.jsx';
import Climb from './components/Climb.jsx';
import Scholarships from './components/Scholarships.jsx';
import Colleges from './components/Colleges.jsx';
import PortfolioTracker from './components/PortfolioTracker.jsx';
import Gallery from './components/Gallery.jsx';
import Writing from './components/Writing.jsx';
import Decisions from './components/Decisions.jsx';
import Savings from './components/Savings.jsx';
import Achievements from './components/Achievements.jsx';
import Resume from './components/Resume.jsx';
import Recommendations from './components/Recommendations.jsx';
import Volunteer from './components/Volunteer.jsx';
import Admin from './components/Admin.jsx';
import Note from './components/Note.jsx';
import Motivation from './components/Motivation.jsx';
import StorageBanner from './components/StorageBanner.jsx';
import { useProgress, useTheme } from './lib/util.js';
import { hydrate } from './lib/store.js';
import { STUDENT } from '../shared/roadmap.js';
import { APP_VERSION } from '../shared/version.js';

const TABS = [
  { id: 'dash',      label: 'Dashboard',    emoji: '🏠' },
  { id: 'note',      label: 'From Dad',     emoji: '💌' },
  { id: 'timeline',  label: 'Roadmap',      emoji: '🛣️' },
  { id: 'climb',     label: 'The Climb',    emoji: '🏔️' },
  { id: 'calendar',  label: 'Calendar',     emoji: '📅' },
  { id: 'portfolio', label: 'Portfolio',    emoji: '🎨' },
  { id: 'gallery',   label: 'Gallery',      emoji: '🖼️' },
  { id: 'writing',   label: 'Writing',      emoji: '✍️' },
  { id: 'achieve',   label: 'Achievements', emoji: '🏅' },
  { id: 'volunteer', label: 'Volunteer',    emoji: '🤝' },
  { id: 'resume',    label: 'Résumé',       emoji: '📄' },
  { id: 'recs',      label: 'Recommendations', emoji: '📜' },
  { id: 'scholar',   label: 'Scholarships', emoji: '🏆' },
  { id: 'colleges',  label: 'Colleges',     emoji: '🎓' },
  { id: 'decisions', label: 'Decisions',    emoji: '📬' },
  { id: 'savings',   label: 'Savings',      emoji: '🐖' },
  { id: 'admin',     label: 'Admin',        emoji: '🛠️' },
];

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('viol_auth') === '1');
  const [tab, setTab] = useState('dash');
  const progress = useProgress();
  const { theme, toggle: toggleTheme } = useTheme();

  // Once signed in, pull the latest data from the server so this browser shows
  // what was saved on any other device. Screens update live as it arrives; the
  // app stays usable from local data the whole time (and if there's no server).
  useEffect(() => {
    if (authed) hydrate();
  }, [authed]);

  if (!authed) return <PublicGallery onUnlock={() => setAuthed(true)} />;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-emoji">🎨</span>
          <div>
            <strong>{STUDENT.name}&rsquo;s Roadmap</strong>
            <span className="brand-sub">{STUDENT.enrollTerm} · aka {STUDENT.nickname}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost theme-toggle" onClick={toggleTheme} aria-label="Toggle light or dark mode" title="Toggle light/dark mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="ghost" onClick={() => { sessionStorage.removeItem('viol_auth'); setAuthed(false); }}>
            Sign out
          </button>
        </div>
      </header>

      <StorageBanner />

      <Motivation />

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden>{t.emoji}</span> {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'dash'      && <Dashboard {...progress} goTo={setTab} />}
        {tab === 'note'      && <Note />}
        {tab === 'timeline'  && <Timeline {...progress} />}
        {tab === 'climb'     && <Climb {...progress} />}
        {tab === 'calendar'  && <CalendarView {...progress} />}
        {tab === 'portfolio' && <PortfolioTracker />}
        {tab === 'gallery'   && <Gallery />}
        {tab === 'writing'   && <Writing />}
        {tab === 'achieve'   && <Achievements />}
        {tab === 'volunteer' && <Volunteer />}
        {tab === 'resume'    && <Resume />}
        {tab === 'recs'      && <Recommendations />}
        {tab === 'scholar'   && <Scholarships {...progress} />}
        {tab === 'colleges'  && <Colleges />}
        {tab === 'decisions' && <Decisions />}
        {tab === 'savings'   && <Savings />}
        {tab === 'admin'     && <Admin />}
      </main>

      <footer className="appfoot">
        Built for {STUDENT.name}. Edit <code>shared/roadmap.js</code> to change any date, school, or scholarship. · v{APP_VERSION}
      </footer>
    </div>
  );
}
