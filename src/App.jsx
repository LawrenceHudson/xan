import { useState } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Timeline from './components/Timeline.jsx';
import CalendarView from './components/CalendarView.jsx';
import Checklist from './components/Checklist.jsx';
import Scholarships from './components/Scholarships.jsx';
import Colleges from './components/Colleges.jsx';
import PortfolioTracker from './components/PortfolioTracker.jsx';
import Gallery from './components/Gallery.jsx';
import Decisions from './components/Decisions.jsx';
import Savings from './components/Savings.jsx';
import Motivation from './components/Motivation.jsx';
import { useProgress } from './lib/util.js';
import { STUDENT } from '../shared/roadmap.js';

const TABS = [
  { id: 'dash',      label: 'Dashboard',    emoji: '🏠' },
  { id: 'timeline',  label: 'Roadmap',      emoji: '🛣️' },
  { id: 'calendar',  label: 'Calendar',     emoji: '📅' },
  { id: 'checklist', label: 'Checklist',    emoji: '✅' },
  { id: 'portfolio', label: 'Portfolio',    emoji: '🎨' },
  { id: 'gallery',   label: 'Gallery',      emoji: '🖼️' },
  { id: 'scholar',   label: 'Scholarships', emoji: '🏆' },
  { id: 'colleges',  label: 'Colleges',     emoji: '🎓' },
  { id: 'decisions', label: 'Decisions',    emoji: '📬' },
  { id: 'savings',   label: 'Savings',      emoji: '🐖' },
];

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('viol_auth') === '1');
  const [tab, setTab] = useState('dash');
  const progress = useProgress();

  if (!authed) return <Login onUnlock={() => setAuthed(true)} />;

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
        <button className="ghost" onClick={() => { sessionStorage.removeItem('viol_auth'); setAuthed(false); }}>
          Sign out
        </button>
      </header>

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
        {tab === 'timeline'  && <Timeline {...progress} />}
        {tab === 'calendar'  && <CalendarView {...progress} />}
        {tab === 'checklist' && <Checklist {...progress} />}
        {tab === 'portfolio' && <PortfolioTracker />}
        {tab === 'gallery'   && <Gallery />}
        {tab === 'scholar'   && <Scholarships {...progress} />}
        {tab === 'colleges'  && <Colleges />}
        {tab === 'decisions' && <Decisions />}
        {tab === 'savings'   && <Savings />}
      </main>

      <footer className="appfoot">
        Built for {STUDENT.name}. Edit <code>shared/roadmap.js</code> to change any date, school, or scholarship.
      </footer>
    </div>
  );
}
