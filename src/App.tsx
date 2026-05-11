import { useState } from 'react';
import { Activity, BarChart3, CalendarDays, Dumbbell, Shield, Trophy, Users } from 'lucide-react';
import { userTeam, teams } from './data/teams';
import { simulateGame, type SimulatedGameResult } from './game/simulateGame';

const navItems = [
  { label: 'Dashboard', icon: Activity, active: true },
  { label: 'Roster', icon: Users, active: false },
  { label: 'Tactics', icon: Shield, active: false },
  { label: 'Schedule', icon: CalendarDays, active: false },
  { label: 'League', icon: Trophy, active: false },
  { label: 'Training', icon: Dumbbell, active: false },
  { label: 'Analytics', icon: BarChart3, active: false },
];

const opponentTeam = teams.find((team) => team.id === 'london-lionsgate') ?? teams[1];

const topPlayers = [...userTeam.roster]
  .sort((a, b) => b.overall - a.overall)
  .slice(0, 3);

export function App() {
  const [latestResult, setLatestResult] = useState<SimulatedGameResult | null>(null);

  const userWonLatestGame = latestResult?.winnerTeamId === userTeam.id;
  const currentRecord = latestResult
    ? `${userWonLatestGame ? 1 : 0}-${userWonLatestGame ? 0 : 1}`
    : `${userTeam.record.wins}-${userTeam.record.losses}`;

  function handleSimulateGame() {
    setLatestResult(simulateGame(userTeam, opponentTeam));
  }

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
              <TeamMini name={opponentTeam.shortName} colour={opponentTeam.primaryColor} />
            </div>
            <h3>{userTeam.name} vs {opponentTeam.name}</h3>
            <p className="muted">Home opener · BSBL Regular Season Game 1</p>
            <button className="primary-action" onClick={handleSimulateGame}>Simulate Game</button>
          </article>

          <article className="panel stat-panel">
            <p className="eyebrow">Current Record</p>
            <strong>{currentRecord}</strong>
            <span className="muted">{latestResult ? 'After Game 1' : 'Season has not started'}</span>
          </article>

          <article className="panel stat-panel">
            <p className="eyebrow">League Position</p>
            <strong>{latestResult ? (userWonLatestGame ? '1st' : '12th') : '—'}</strong>
            <span className="muted">{latestResult ? 'Early-season estimate' : 'Awaiting first game'}</span>
          </article>

          <article className="panel stat-panel">
            <p className="eyebrow">Board Confidence</p>
            <strong>{latestResult ? (userWonLatestGame ? '76%' : '68%') : '72%'}</strong>
            <span className={latestResult && !userWonLatestGame ? 'warning' : 'positive'}>
              {latestResult ? (userWonLatestGame ? 'Rising' : 'Watching closely') : 'Stable'}
            </span>
          </article>

          {latestResult && (
            <article className="panel wide-panel result-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Latest Result</p>
                  <h3>{userWonLatestGame ? 'Opening night win' : 'Opening night defeat'}</h3>
                </div>
                <span className="chip">Final</span>
              </div>
              <div className="scoreboard-row">
                <ScoreBlock team={userTeam.shortName} score={latestResult.homeScore} colour={userTeam.primaryColor} />
                <span className="versus">—</span>
                <ScoreBlock team={opponentTeam.shortName} score={latestResult.awayScore} colour={opponentTeam.primaryColor} />
              </div>
              <p className="muted">{latestResult.summary}</p>
            </article>
          )}

          <article className="panel wide-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Top Players</p>
                <h3>{latestResult ? 'Game Leaders' : 'Starting Core'}</h3>
              </div>
              <span className="chip">{latestResult ? 'Box Score' : userTeam.playStyle}</span>
            </div>
            <div className="player-list">
              {(latestResult ? latestResult.topPerformers.slice(0, 3) : topPlayers).map((player) => (
                'playerName' in player ? (
                  <div className="player-row" key={player.playerId}>
                    <div>
                      <strong>{player.playerName}</strong>
                      <span>{player.teamName} · {player.rebounds} REB · {player.assists} AST</span>
                    </div>
                    <div className="rating-pill">{player.points}</div>
                  </div>
                ) : (
                  <div className="player-row" key={player.id}>
                    <div>
                      <strong>{player.name}</strong>
                      <span>{player.position} · {player.archetype}</span>
                    </div>
                    <div className="rating-pill">{player.overall}</div>
                  </div>
                )
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
                  <strong>{getDisplayRecord(team.id, latestResult)}</strong>
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

type ScoreBlockProps = {
  team: string;
  score: number;
  colour: string;
};

function ScoreBlock({ team, score, colour }: ScoreBlockProps) {
  return (
    <div className="score-block" style={{ borderColor: colour }}>
      <span>{team}</span>
      <strong>{score}</strong>
    </div>
  );
}

function getDisplayRecord(teamId: string, latestResult: SimulatedGameResult | null) {
  if (!latestResult || (teamId !== latestResult.homeTeamId && teamId !== latestResult.awayTeamId)) {
    return '0-0';
  }

  return latestResult.winnerTeamId === teamId ? '1-0' : '0-1';
}
