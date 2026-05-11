import { useState } from 'react';
import { Activity, BarChart3, CalendarDays, Dumbbell, Shield, Trophy, Users } from 'lucide-react';
import { RosterScreen } from './components/RosterScreen';
import { TacticsScreen } from './components/TacticsScreen';
import { getFixturesForRound, seasonFixtures } from './data/fixtures';
import { userTeam, teams } from './data/teams';
import { calculateStandings } from './game/calculateStandings';
import { simulateGame, type SimulatedGameResult } from './game/simulateGame';
import { defaultTactics, type TacticalSettings } from './game/tactics';
import { calculateWinProbability } from './game/winProbability';
import type { Fixture, Team } from './types/basketball';

type ActiveView = 'Dashboard' | 'Roster' | 'Tactics';

const navItems = [
  { label: 'Dashboard', icon: Activity, enabled: true },
  { label: 'Roster', icon: Users, enabled: true },
  { label: 'Tactics', icon: Shield, enabled: true },
  { label: 'Schedule', icon: CalendarDays, enabled: false },
  { label: 'League', icon: Trophy, enabled: false },
  { label: 'Training', icon: Dumbbell, enabled: false },
  { label: 'Analytics', icon: BarChart3, enabled: false },
] as const;

const totalRounds = Math.max(...seasonFixtures.map((fixture) => fixture.round));
const topPlayers = [...userTeam.roster]
  .sort((a, b) => b.overall - a.overall)
  .slice(0, 3);

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('Dashboard');
  const [results, setResults] = useState<SimulatedGameResult[]>([]);
  const [tactics, setTactics] = useState<TacticalSettings>(defaultTactics);

  const latestResult = results.at(-1) ?? null;
  const standings = calculateStandings(teams, results);
  const userStanding = standings.find((standing) => standing.teamId === userTeam.id);
  const nextFixture = seasonFixtures.find((fixture) => !hasResultForFixture(fixture, results));
  const currentRound = nextFixture?.round ?? totalRounds;
  const currentRoundFixtures = getFixturesForRound(currentRound);
  const userGameResult = results.find((result) => result.homeTeamId === userTeam.id || result.awayTeamId === userTeam.id) ?? null;
  const userWonLatestGame = userGameResult?.winnerTeamId === userTeam.id;
  const nextHomeTeam = nextFixture ? getTeam(nextFixture.homeTeamId) : null;
  const nextAwayTeam = nextFixture ? getTeam(nextFixture.awayTeamId) : null;
  const nextMatchupLabel = nextHomeTeam && nextAwayTeam
    ? calculateWinProbability(nextHomeTeam, nextAwayTeam, {
      homeTactics: nextHomeTeam.id === userTeam.id ? tactics : defaultTactics,
      awayTactics: nextAwayTeam.id === userTeam.id ? tactics : defaultTactics,
    }).matchupLabel
    : null;

  function handleSimulateNextFixture() {
    if (!nextFixture) return;

    setResults((currentResults) => {
      if (hasResultForFixture(nextFixture, currentResults)) return currentResults;

      return [...currentResults, simulateFixture(nextFixture, tactics)];
    });
  }

  function handleSimulateCurrentRound() {
    setResults((currentResults) => {
      const newResults = currentRoundFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => simulateFixture(fixture, tactics));

      return [...currentResults, ...newResults];
    });
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
            const isActive = activeView === item.label;
            return (
              <button
                className={isActive ? 'nav-item active' : 'nav-item'}
                disabled={!item.enabled}
                key={item.label}
                onClick={() => item.enabled && setActiveView(item.label as ActiveView)}
              >
                <Icon size={18} />
                {item.label}
                {!item.enabled && <span className="soon-pill">Soon</span>}
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

        {activeView === 'Dashboard' && (
          <DashboardView
            currentRound={currentRound}
            handleSimulateNextFixture={handleSimulateNextFixture}
            handleSimulateCurrentRound={handleSimulateCurrentRound}
            latestResult={latestResult}
            nextAwayTeam={nextAwayTeam}
            nextFixture={nextFixture}
            nextHomeTeam={nextHomeTeam}
            nextMatchupLabel={nextMatchupLabel}
            results={results}
            standings={standings}
            tactics={tactics}
            userGameResult={userGameResult}
            userStanding={userStanding}
            userWonLatestGame={userWonLatestGame}
          />
        )}

        {activeView === 'Roster' && <RosterScreen team={userTeam} />}
        {activeView === 'Tactics' && <TacticsScreen team={userTeam} tactics={tactics} onTacticsChange={setTactics} />}
      </section>
    </main>
  );
}

type DashboardViewProps = {
  currentRound: number;
  handleSimulateNextFixture: () => void;
  handleSimulateCurrentRound: () => void;
  latestResult: SimulatedGameResult | null;
  nextAwayTeam: Team | null;
  nextFixture: Fixture | undefined;
  nextHomeTeam: Team | null;
  nextMatchupLabel: string | null;
  results: SimulatedGameResult[];
  standings: ReturnType<typeof calculateStandings>;
  tactics: TacticalSettings;
  userGameResult: SimulatedGameResult | null;
  userStanding: ReturnType<typeof calculateStandings>[number] | undefined;
  userWonLatestGame: boolean;
};

function DashboardView({
  currentRound,
  handleSimulateNextFixture,
  handleSimulateCurrentRound,
  latestResult,
  nextAwayTeam,
  nextFixture,
  nextHomeTeam,
  nextMatchupLabel,
  results,
  standings,
  tactics,
  userGameResult,
  userStanding,
  userWonLatestGame,
}: DashboardViewProps) {
  return (
    <section className="dashboard-grid">
      <article className="panel next-game-panel">
        <p className="eyebrow">Next Fixture</p>
        {nextFixture && nextHomeTeam && nextAwayTeam ? (
          <>
            <div className="matchup-row">
              <TeamMini name={nextHomeTeam.shortName} colour={nextHomeTeam.primaryColor} />
              <span className="versus">VS</span>
              <TeamMini name={nextAwayTeam.shortName} colour={nextAwayTeam.primaryColor} />
            </div>
            <h3>{nextHomeTeam.name} vs {nextAwayTeam.name}</h3>
            <p className="muted">Round {nextFixture.round} of {totalRounds} · BSBL Regular Season</p>
            <div className="tactics-summary-row">
              <span>{nextMatchupLabel ?? 'Hidden matchup'}</span>
              <span>{tactics.pace}</span>
              <span>{tactics.offensiveFocus}</span>
              <span>{tactics.defensiveStyle}</span>
            </div>
            <button className="primary-action" onClick={handleSimulateNextFixture}>Simulate Next Fixture</button>
            <button className="secondary-action" onClick={handleSimulateCurrentRound}>Simulate Round {currentRound}</button>
          </>
        ) : (
          <>
            <h3>Regular season complete</h3>
            <p className="muted">All {seasonFixtures.length} BSBL regular season games have been simulated.</p>
          </>
        )}
      </article>

      <article className="panel stat-panel">
        <p className="eyebrow">Current Record</p>
        <strong>{userStanding?.wins ?? 0}-{userStanding?.losses ?? 0}</strong>
        <span className="muted">{userStanding?.played ? `After ${userStanding.played} game${userStanding.played === 1 ? '' : 's'}` : 'Season has not started'}</span>
      </article>

      <article className="panel stat-panel">
        <p className="eyebrow">League Position</p>
        <strong>{getOrdinalPosition(standings.findIndex((standing) => standing.teamId === userTeam.id) + 1)}</strong>
        <span className="muted">{results.length ? 'Live standings' : 'Awaiting first game'}</span>
      </article>

      <article className="panel stat-panel">
        <p className="eyebrow">Board Confidence</p>
        <strong>{userGameResult ? (userWonLatestGame ? '76%' : '68%') : '72%'}</strong>
        <span className={userGameResult && !userWonLatestGame ? 'warning' : 'positive'}>
          {userGameResult ? (userWonLatestGame ? 'Rising' : 'Watching closely') : 'Stable'}
        </span>
      </article>

      {latestResult && (
        <article className="panel wide-panel result-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Latest Result</p>
              <h3>{getTeam(latestResult.winnerTeamId).name} win</h3>
            </div>
            <span className="chip">{latestResult.matchupLabel}</span>
          </div>
          <div className="scoreboard-row">
            <ScoreBlock team={getTeam(latestResult.homeTeamId).shortName} score={latestResult.homeScore} colour={getTeam(latestResult.homeTeamId).primaryColor} />
            <span className="versus">—</span>
            <ScoreBlock team={getTeam(latestResult.awayTeamId).shortName} score={latestResult.awayScore} colour={getTeam(latestResult.awayTeamId).primaryColor} />
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
            <p className="eyebrow">League Table</p>
            <h3>BSBL Standings</h3>
          </div>
          <span className="chip">{results.length}/{seasonFixtures.length} games played</span>
        </div>
        <div className="league-list">
          {standings.map((standing, index) => (
            <div className="league-row" key={standing.teamId}>
              <span className="standings-rank">{index + 1}</span>
              <span className="team-dot" style={{ background: standing.primaryColor }} />
              <span>{standing.teamName}</span>
              <span className="muted">{standing.wins}-{standing.losses}</span>
              <strong>{standing.pointDifference > 0 ? `+${standing.pointDifference}` : standing.pointDifference}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
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

function simulateFixture(fixture: Fixture, tactics: TacticalSettings) {
  const homeTeam = getTeam(fixture.homeTeamId);
  const awayTeam = getTeam(fixture.awayTeamId);
  const homeTactics = homeTeam.id === userTeam.id ? tactics : defaultTactics;
  const awayTactics = awayTeam.id === userTeam.id ? tactics : defaultTactics;

  return simulateGame(homeTeam, awayTeam, { homeTactics, awayTactics });
}

function getTeam(teamId: string): Team {
  const team = teams.find((candidate) => candidate.id === teamId);

  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  return team;
}

function hasResultForFixture(fixture: Fixture, results: SimulatedGameResult[]) {
  return results.some((result) => isResultForFixture(fixture, result));
}

function isResultForFixture(fixture: Fixture, result: SimulatedGameResult) {
  return result.homeTeamId === fixture.homeTeamId && result.awayTeamId === fixture.awayTeamId;
}

function getOrdinalPosition(position: number) {
  if (position <= 0) return '—';

  const suffix = position % 10 === 1 && position !== 11
    ? 'st'
    : position % 10 === 2 && position !== 12
      ? 'nd'
      : position % 10 === 3 && position !== 13
        ? 'rd'
        : 'th';

  return `${position}${suffix}`;
}
