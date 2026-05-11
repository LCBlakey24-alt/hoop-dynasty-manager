import { Activity, BarChart3, CalendarDays, Dumbbell, Shield, Trophy, Users } from 'lucide-react';
import { userTeam, teams } from './data/teams';

const navItems = [
  { label: 'Dashboard', icon: Activity, active: true },
  { label: 'Roster', icon: Users, active: false },
  { label: 'Tactics', icon: Shield, active: false },
  { label: 'Schedule', icon: CalendarDays, active: false },
  { label: 'League', icon: Trophy, active: false },
  { label: 'Training', icon: Dumbbell, active: false },
  { label: 'Analytics', icon: BarChart3, active: false },
];

const topPlayers = [...userTeam.roster]
  .sort((a, b) => b.overall - a.overall)
  .slice(0, 3);

export function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">HD</div>
          <div>
            <p className="eyebrow">Prototype 0.1</p>
            <h1>Hoop Dynasty</h1>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={item.active ? 'nav-item active' : 'nav-item'} key={item.label}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="content-area">
        <header className="hero-card">
          <div>
            <p className="eyebrow">British Super Basketball League · {userTeam.nation}</p>
            <h2>{userTeam.name}</h2>
            <p className="hero-copy">{userTeam.identity}. Built for {userTeam.playStyle.toLowerCase()} basketball.</p>
          </div>
          <div className="team-badge" style={{ borderColor: userTeam.primaryColor }}>
            {userTeam.shortName}
          </div>
        </header>

        <section className="dashboard-grid">
          <article className="panel next-game-panel">
            <p className="eyebrow">Next Fixture</p>
            <div className="matchup-row">
              <TeamMini name={userTeam.shortName} colour={userTeam.primaryColor} />
              <span className="versus">VS</span>
              <TeamMini name="LON" colour="#D4AF37" />
            </div>
            <h3>{userTeam.name} vs London Lionsgate</h3>
            <p className="muted">Home opener · BSBL Regular Season Game 1</p>
            <button className="primary-action">Simulate Game</button>
          </article>

          <article className="panel stat-panel">
            <p className="eyebrow">Current Record</p>
            <strong>{userTeam.record.wins}-{userTeam.record.losses}</strong>
            <span className="muted">Season has not started</span>
          </article>

          <article className="panel stat-panel">
            <p className="eyebrow">League Position</p>
            <strong>—</strong>
            <span className="muted">Awaiting first game</span>
          </article>

          <article className="panel stat-panel">
            <p className="eyebrow">Board Confidence</p>
            <strong>72%</strong>
            <span className="positive">Stable</span>
          </article>

          <article className="panel wide-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Top Players</p>
                <h3>Starting Core</h3>
              </div>
              <span className="chip">{userTeam.playStyle}</span>
            </div>
            <div className="player-list">
              {topPlayers.map((player) => (
                <div className="player-row" key={player.id}>
                  <div>
                    <strong>{player.name}</strong>
                    <span>{player.position} · {player.archetype}</span>
                  </div>
                  <div className="rating-pill">{player.overall}</div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel wide-panel league-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">League Snapshot</p>
                <h3>BSBL Teams</h3>
              </div>
              <span className="chip">12 planned · 12 seeded</span>
            </div>
            <div className="league-list">
              {teams.map((team) => (
                <div className="league-row" key={team.id}>
                  <span className="team-dot" style={{ background: team.primaryColor }} />
                  <span>{team.name}</span>
                  <span className="muted">{team.nation}</span>
                  <strong>{team.record.wins}-{team.record.losses}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

type TeamMiniProps = {
  name: string;
  colour: string;
};

function TeamMini({ name, colour }: TeamMiniProps) {
  return (
    <div className="team-mini" style={{ borderColor: colour }}>
      <span>{name}</span>
    </div>
  );
}
