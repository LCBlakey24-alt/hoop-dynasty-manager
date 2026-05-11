import { useEffect, useState } from 'react';
import { Activity, BarChart3, CalendarDays, ClipboardList, Dumbbell, FileText, Medal, Shield, Trophy, Users } from 'lucide-react';
import { LeagueScreen } from './components/LeagueScreen';
import { MatchResultScreen } from './components/MatchResultScreen';
import { PlayoffsScreen } from './components/PlayoffsScreen';
import { RosterScreen } from './components/RosterScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { SeasonSummaryScreen } from './components/SeasonSummaryScreen';
import { TacticsScreen } from './components/TacticsScreen';
import { TeamSelectScreen } from './components/TeamSelectScreen';
import { getFixturesForRound, seasonFixtures } from './data/fixtures';
import { teams } from './data/teams';
import { calculateStandings } from './game/calculateStandings';
import { clearLocalSeasonSave, loadLocalSeasonSave, saveLocalSeason } from './game/localSave';
import { createFinalMatchup, createQuarterFinalMatchups, createSemiFinalMatchups, type PlayoffMatchup } from './game/playoffs';
import { simulateGame, type SimulatedGameResult } from './game/simulateGame';
import { defaultTactics, type TacticalSettings } from './game/tactics';
import { calculateWinProbability } from './game/winProbability';
import type { Fixture, Team } from './types/basketball';

type ActiveView = 'Dashboard' | 'Team Select' | 'Roster' | 'Tactics' | 'Schedule' | 'Results' | 'League' | 'Playoffs' | 'Summary';

const navItems = [
  { label: 'Dashboard', icon: Activity, enabled: true },
  { label: 'Team Select', icon: Users, enabled: true },
  { label: 'Roster', icon: Users, enabled: true },
  { label: 'Tactics', icon: Shield, enabled: true },
  { label: 'Schedule', icon: CalendarDays, enabled: true },
  { label: 'Results', icon: ClipboardList, enabled: true },
  { label: 'League', icon: Trophy, enabled: true },
  { label: 'Playoffs', icon: Medal, enabled: true },
  { label: 'Summary', icon: FileText, enabled: true },
  { label: 'Training', icon: Dumbbell, enabled: false },
  { label: 'Analytics', icon: BarChart3, enabled: false },
] as const;

const DEFAULT_TEAM_ID = 'bristol-breakers';
const totalRounds = Math.max(...seasonFixtures.map((fixture) => fixture.round));
const initialSave = typeof window === 'undefined' ? null : loadLocalSeasonSave();

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('Dashboard');
  const [results, setResults] = useState<SimulatedGameResult[]>(initialSave?.results ?? []);
  const [playoffResults, setPlayoffResults] = useState<SimulatedGameResult[]>(initialSave?.playoffResults ?? []);
  const [selectedTeamId, setSelectedTeamId] = useState(initialSave?.selectedTeamId ?? DEFAULT_TEAM_ID);
  const [tactics, setTactics] = useState<TacticalSettings>(initialSave?.tactics ?? defaultTactics);
  const [savedAt, setSavedAt] = useState<string | null>(initialSave?.savedAt ?? null);

  const selectedTeam = getTeam(selectedTeamId);
  const topPlayers = [...selectedTeam.roster]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 3);

  useEffect(() => {
    const save = saveLocalSeason(results, tactics, playoffResults, selectedTeamId);
    setSavedAt(save.savedAt);
  }, [results, tactics, playoffResults, selectedTeamId]);

  const latestResult = playoffResults.at(-1) ?? results.at(-1) ?? null;
  const standings = calculateStandings(teams, results);
  const userStanding = standings.find((standing) => standing.teamId === selectedTeam.id);
  const nextFixture = seasonFixtures.find((fixture) => !hasResultForFixture(fixture, results));
  const currentRound = nextFixture?.round ?? totalRounds;
  const currentRoundFixtures = getFixturesForRound(currentRound);
  const userGameResult = [...results].reverse().find((result) => result.homeTeamId === selectedTeam.id || result.awayTeamId === selectedTeam.id) ?? null;
  const userWonLatestGame = userGameResult?.winnerTeamId === selectedTeam.id;
  const boardConfidence = calculateBoardConfidence({ standings, selectedTeamId: selectedTeam.id, latestUserGame: userGameResult });
  const nextHomeTeam = nextFixture ? getTeam(nextFixture.homeTeamId) : null;
  const nextAwayTeam = nextFixture ? getTeam(nextFixture.awayTeamId) : null;
  const nextMatchupLabel = nextHomeTeam && nextAwayTeam
    ? calculateWinProbability(nextHomeTeam, nextAwayTeam, {
      homeTactics: nextHomeTeam.id === selectedTeam.id ? tactics : defaultTactics,
      awayTactics: nextAwayTeam.id === selectedTeam.id ? tactics : defaultTactics,
    }).matchupLabel
    : null;

  function handleResetSeason() {
    clearLocalSeasonSave();
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
  }

  function handleSelectTeam(teamId: string) {
    setSelectedTeamId(teamId);
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setActiveView('Dashboard');
  }

  function handleSimulateNextFixture() {
    if (!nextFixture) return;

    setResults((currentResults) => {
      if (hasResultForFixture(nextFixture, currentResults)) return currentResults;

      return [...currentResults, simulateFixture(nextFixture, tactics, selectedTeam.id)];
    });
  }

  function handleSimulateCurrentRound() {
    setResults((currentResults) => {
      const newResults = currentRoundFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => simulateFixture(fixture, tactics, selectedTeam.id));

      return [...currentResults, ...newResults];
    });
  }

  function handleSimulateRestOfSeason() {
    setResults((currentResults) => {
      const newResults = seasonFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => simulateFixture(fixture, tactics, selectedTeam.id));

      return [...currentResults, ...newResults];
    });
  }

  function handleSimulatePlayoffMatchups(matchups: PlayoffMatchup[]) {
    setPlayoffResults((currentResults) => {
      const newResults = matchups
        .filter((matchup) => !currentResults.some((result) => result.homeTeamId === matchup.homeSeed.standing.teamId && result.awayTeamId === matchup.awaySeed.standing.teamId))
        .map((matchup) => simulateGame(
          getTeam(matchup.homeSeed.standing.teamId),
          getTeam(matchup.awaySeed.standing.teamId),
          {
            homeTactics: matchup.homeSeed.standing.teamId === selectedTeam.id ? tactics : defaultTactics,
            awayTactics: matchup.awaySeed.standing.teamId === selectedTeam.id ? tactics : defaultTactics,
          },
        ));

      return [...currentResults, ...newResults];
    });
  }

  function handleSimulateQuarterFinals() {
    handleSimulatePlayoffMatchups(createQuarterFinalMatchups(standings));
  }

  function handleSimulateSemiFinals() {
    handleSimulatePlayoffMatchups(createSemiFinalMatchups(standings, playoffResults));
  }

  function handleSimulateFinal() {
    const final = createFinalMatchup(standings, playoffResults);

    if (!final) return;

    handleSimulatePlayoffMatchups([final]);
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
            <p className="eyebrow">British Super Basketball League · {selectedTeam.nation}</p>
            <h2>{selectedTeam.name}</h2>
            <p className="hero-copy">{selectedTeam.identity}. Built for {selectedTeam.playStyle.toLowerCase()} basketball.</p>
          </div>
          <div className="team-badge" style={{ borderColor: selectedTeam.primaryColor }}>
            {selectedTeam.shortName}
          </div>
        </header>

        {activeView === 'Dashboard' && (
          <DashboardView
            currentRound={currentRound}
            handleResetSeason={handleResetSeason}
            handleSimulateNextFixture={handleSimulateNextFixture}
            handleSimulateCurrentRound={handleSimulateCurrentRound}
            handleSimulateRestOfSeason={handleSimulateRestOfSeason}
            latestResult={latestResult}
            nextAwayTeam={nextAwayTeam}
            nextFixture={nextFixture}
            nextHomeTeam={nextHomeTeam}
            nextMatchupLabel={nextMatchupLabel}
            results={results}
            savedAt={savedAt}
            selectedTeam={selectedTeam}
            standings={standings}
            tactics={tactics}
            userGameResult={userGameResult}
            userStanding={userStanding}
            userWonLatestGame={userWonLatestGame}
            boardConfidence={boardConfidence}
            topPlayers={topPlayers}
          />
        )}

        {activeView === 'Team Select' && <TeamSelectScreen selectedTeamId={selectedTeam.id} teams={teams} onSelectTeam={handleSelectTeam} />}
        {activeView === 'Roster' && <RosterScreen team={selectedTeam} />}
        {activeView === 'Tactics' && <TacticsScreen team={selectedTeam} tactics={tactics} onTacticsChange={setTactics} />}
        {activeView === 'Schedule' && (
          <ScheduleScreen
            currentRound={currentRound}
            fixtures={seasonFixtures}
            results={results}
            teams={teams}
            totalRounds={totalRounds}
          />
        )}
        {activeView === 'Results' && <MatchResultScreen latestResult={latestResult} teams={teams} />}
        {activeView === 'League' && (
          <LeagueScreen
            gamesPlayed={results.length}
            standings={standings}
            totalGames={seasonFixtures.length}
            userTeamId={selectedTeam.id}
          />
        )}
        {activeView === 'Playoffs' && (
          <PlayoffsScreen
            gamesPlayed={results.length}
            onSimulateFinal={handleSimulateFinal}
            onSimulateQuarterFinals={handleSimulateQuarterFinals}
            onSimulateSemiFinals={handleSimulateSemiFinals}
            playoffResults={playoffResults}
            standings={standings}
            totalGames={seasonFixtures.length}
            userTeamId={selectedTeam.id}
          />
        )}
        {activeView === 'Summary' && (
          <SeasonSummaryScreen
            gamesPlayed={results.length}
            playoffResults={playoffResults}
            standings={standings}
            totalGames={seasonFixtures.length}
            userTeamId={selectedTeam.id}
          />
        )}
      </section>
    </main>
  );
}

type DashboardViewProps = {
  currentRound: number;
  handleResetSeason: () => void;
  handleSimulateNextFixture: () => void;
  handleSimulateCurrentRound: () => void;
  handleSimulateRestOfSeason: () => void;
  latestResult: SimulatedGameResult | null;
  nextAwayTeam: Team | null;
  nextFixture: Fixture | undefined;
  nextHomeTeam: Team | null;
  nextMatchupLabel: string | null;
  results: SimulatedGameResult[];
  savedAt: string | null;
  selectedTeam: Team;
  standings: ReturnType<typeof calculateStandings>;
  tactics: TacticalSettings;
  topPlayers: Team['roster'];
  userGameResult: SimulatedGameResult | null;
  userStanding: ReturnType<typeof calculateStandings>[number] | undefined;
  userWonLatestGame: boolean;
  boardConfidence: number;
};

function DashboardView({
  currentRound,
  handleResetSeason,
  handleSimulateNextFixture,
  handleSimulateCurrentRound,
  handleSimulateRestOfSeason,
  latestResult,
  nextAwayTeam,
  nextFixture,
  nextHomeTeam,
  nextMatchupLabel,
  results,
  savedAt,
  selectedTeam,
  standings,
  tactics,
  topPlayers,
  userGameResult,
  userStanding,
  userWonLatestGame,
  boardConfidence,
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
            <button className="secondary-action" onClick={handleSimulateRestOfSeason}>Simulate Rest of Season</button>
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
        <strong>{getOrdinalPosition(standings.findIndex((standing) => standing.teamId === selectedTeam.id) + 1)}</strong>
        <span className="muted">{results.length ? 'Live standings' : 'Awaiting first game'}</span>
      </article>

      <article className="panel stat-panel">
        <p className="eyebrow">Board Confidence</p>
        <strong>{boardConfidence}%</strong>
        <span className={userGameResult && !userWonLatestGame ? 'warning' : 'positive'}>
          {userGameResult ? (userWonLatestGame ? 'Rising' : 'Watching closely') : 'Stable'}
        </span>
      </article>

      <article className="panel wide-panel save-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Local Save</p>
            <h3>Browser season save</h3>
          </div>
          <span className="chip">Auto-save</span>
        </div>
        <p className="muted">
          {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : 'No saved season yet.'}
        </p>
        <button className="secondary-action danger-action" onClick={handleResetSeason}>Reset Local Season</button>
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
          <span className="chip">{latestResult ? 'Box Score' : selectedTeam.playStyle}</span>
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

function simulateFixture(fixture: Fixture, tactics: TacticalSettings, selectedTeamId: string) {
  const homeTeam = getTeam(fixture.homeTeamId);
  const awayTeam = getTeam(fixture.awayTeamId);
  const homeTactics = homeTeam.id === selectedTeamId ? tactics : defaultTactics;
  const awayTactics = awayTeam.id === selectedTeamId ? tactics : defaultTactics;

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

function calculateBoardConfidence({
  standings,
  selectedTeamId,
  latestUserGame,
}: {
  standings: ReturnType<typeof calculateStandings>;
  selectedTeamId: string;
  latestUserGame: SimulatedGameResult | null;
}) {
  const teamIndex = standings.findIndex((standing) => standing.teamId === selectedTeamId);

  if (teamIndex === -1) return 70;

  const standing = standings[teamIndex];
  const rank = teamIndex + 1;
  const totalTeams = standings.length;
  const rankScore = Math.round(((totalTeams - rank) / Math.max(1, totalTeams - 1)) * 22);
  const recordScore = Math.round((standing.winPercentage - 0.5) * 40);
  const pdScore = Math.max(-8, Math.min(8, Math.round(standing.pointDifference / Math.max(1, standing.played * 2.5))));
  const latestGameScore = latestUserGame ? (latestUserGame.winnerTeamId === selectedTeamId ? 4 : -5) : 0;

  return Math.max(40, Math.min(96, 68 + rankScore + recordScore + pdScore + latestGameScore));
}
