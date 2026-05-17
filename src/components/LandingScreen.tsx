import { useState } from 'react';

type LandingScreenProps = {
  hasSave: boolean;
  selectedTeamName: string;
  reducedMotion: boolean;
  onContinue: () => void;
  onNewFranchise: () => void;
};

const comingSoonModes = [
  {
    title: 'Player Career',
    description: 'Create one player, earn minutes, chase awards and build a legacy across multiple teams.',
  },
  {
    title: 'Custom League',
    description: 'Build your own teams, formats, countries and fictional basketball universe.',
  },
  {
    title: 'Settings',
    description: 'Game speed, display preferences, save options and accessibility controls.',
  },
];

const globalLeaguesRoadmap = [
  { name: 'BSBL (United Kingdom)', status: 'Playable now' },
  { name: 'NABL (North America)', status: 'In production' },
  { name: 'Euro Continental League', status: 'In production' },
  { name: 'Liga del Sol (South America)', status: 'Planned' },
  { name: 'Pacific Hoops Federation', status: 'Planned' },
];

const franchiseHighlights = [
  'Live sim controls with key-event targeting',
  'Manager inbox with pin, snooze and overdue triage',
  'Roster growth tracking with position edits',
];

export function LandingScreen({ hasSave, selectedTeamName, onContinue, onNewFranchise }: LandingScreenProps) {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('hoop-dynasty-hide-intro') !== '1';
  });

  function handleStartGame() {
    setShowIntro(false);
  }

  function handleToggleShowIntro(enabled: boolean) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hoop-dynasty-hide-intro', enabled ? '0' : '1');
    }
  }

  if (showIntro) {
    return (
      <section className="landing-screen intro-screen">
        <article className="panel intro-cinematic">
          <p className="eyebrow intro-kicker">Rookie Quest Game presents</p>
          <div className="intro-logo-mark" aria-hidden>RQ</div>
          <h1>Hardwood Dynasty</h1>
          <p className="landing-copy">A management journey from prospect projects to championship banners.</p>
          <div className="landing-actions">
            <button className="primary-action" onClick={handleStartGame}>Start Game</button>
            <button className="secondary-action" onClick={hasSave ? onContinue : onNewFranchise}>
              {hasSave ? `Quick Continue ${selectedTeamName}` : 'Skip To Franchise Setup'}
            </button>
          </div>
          <label className="intro-pref">
            <input type="checkbox" defaultChecked onChange={(event) => handleToggleShowIntro(event.target.checked)} />
            Show this intro on startup
          </label>
        </article>
      </section>
    );
  }

  return (
    <section className="landing-screen">
      <article className="landing-splash panel">
        <div className="landing-logo-mark">HD</div>
        <p className="eyebrow">Hoop Dynasty Manager</p>
        <h1>Midnight Court</h1>
        <p className="landing-copy">A basketball management world built for long-term legacy saves.</p>
        <button className="primary-action" onClick={hasSave ? onContinue : onNewFranchise}>
          {hasSave ? 'Start / Continue' : 'Start Game'}
        </button>
      </article>

      <article className="landing-hero panel">
        <p className="eyebrow">Hoop Dynasty Manager</p>
        <h2>Build a basketball dynasty from the bench, the boardroom and the box score.</h2>
        <p className="landing-copy">
          Take charge of a fictional British basketball club, manage tactics, develop players, survive the season and chase the BSBL title.
        </p>
        <div className="landing-highlights">
          {franchiseHighlights.map((highlight) => (
            <span className="chip" key={highlight}>{highlight}</span>
          ))}
        </div>
        <div className="landing-actions">
          <button className="primary-action" disabled={!hasSave} onClick={onContinue}>
            {hasSave ? `Continue ${selectedTeamName}` : 'No Save Found'}
          </button>
          <button className="secondary-action" onClick={onNewFranchise}>New Franchise</button>
        </div>
      </article>

      <section className="mode-card-grid">
        <article className="panel mode-card playable">
          <div>
            <p className="eyebrow">Playable Now</p>
            <h3>Franchise Mode</h3>
            <p>Choose a BSBL club, play a full season, manage tactics, simulate playoffs and crown a champion.</p>
          </div>
          <button className="primary-action" onClick={hasSave ? onContinue : onNewFranchise}>
            {hasSave ? 'Continue Franchise' : 'Start Franchise'}
          </button>
        </article>

        {comingSoonModes.map((mode) => (
          <article className="panel mode-card locked" key={mode.title}>
            <span className="coming-soon-banner">Coming Soon</span>
            <div>
              <p className="eyebrow">Future Mode</p>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
            </div>
            <button className="secondary-action" disabled>Locked</button>
          </article>
        ))}
      </section>

      <article className="panel league-roadmap-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Global Universe Roadmap</p>
            <h3>Leagues inspired by real-world regions</h3>
          </div>
          <span className="chip">World expansion</span>
        </div>
        <p className="landing-copy">
          Current and future fictional leagues are designed to mirror real basketball ecosystems while keeping full creative freedom for clubs, identities and stories.
        </p>
        <div className="league-roadmap-grid">
          {globalLeaguesRoadmap.map((league) => (
            <div className="league-roadmap-item" key={league.name}>
              <strong>{league.name}</strong>
              <span>{league.status}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
