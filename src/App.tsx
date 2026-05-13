import { useEffect, useState } from 'react';
import { Activity, BarChart3, CalendarDays, ClipboardList, Dumbbell, FileText, Medal, Shield, Trophy, Users } from 'lucide-react';
import { LandingScreen } from './components/LandingScreen';
import { LeagueScreen } from './components/LeagueScreen';
import { MatchResultScreen } from './components/MatchResultScreen';
import { PlayoffsScreen } from './components/PlayoffsScreen';
import { RosterScreen } from './components/RosterScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { SeasonSummaryScreen } from './components/SeasonSummaryScreen';
import { TacticsScreen } from './components/TacticsScreen';
import { TeamSelectScreen } from './components/TeamSelectScreen';
import { TrainingScreen, type TrainingFocus } from './components/TrainingScreen';
import { getFixturesForRound, seasonFixtures } from './data/fixtures';
import { teams } from './data/teams';
import { calculateStandings } from './game/calculateStandings';
import { clearLocalSeasonSave, loadLocalSeasonSave, saveLocalSeason } from './game/localSave';
import { applyPostGameCondition } from './game/playerCondition';
import { applyTrainingFocus } from './game/training';
import { createFinalMatchup, createQuarterFinalMatchups, createSemiFinalMatchups, type PlayoffMatchup } from './game/playoffs';
import { createDefaultRotation, normaliseRotation } from './game/rotation';
import { simulateGame, type SimulatedGameResult } from './game/simulateGame';
import { defaultTactics, type TacticalSettings } from './game/tactics';
import { calculateWinProbability } from './game/winProbability';
import type { Fixture, RotationPlan, Team } from './types/basketball';

type ActiveView = 'Landing' | 'Dashboard' | 'Team Select' | 'Roster' | 'Tactics' | 'Schedule' | 'Results' | 'League' | 'Playoffs' | 'Summary' | 'Training';

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
  { label: 'Training', icon: Dumbbell, enabled: true },
  { label: 'Analytics', icon: BarChart3, enabled: false },
] as const;

const DEFAULT_TEAM_ID = 'bristol-breakers';
const totalRounds = Math.max(...seasonFixtures.map((fixture) => fixture.round));
const initialSave = typeof window === 'undefined' ? null : loadLocalSeasonSave();
const initialTeamId = initialSave?.selectedTeamId ?? DEFAULT_TEAM_ID;
const initialSelectedTeam = initialSave?.selectedTeamState?.id === initialTeamId
  ? initialSave.selectedTeamState
  : getTeam(initialTeamId);
const initialRotation = normaliseRotation(initialSelectedTeam, initialSave?.rotationPlan ?? createDefaultRotation(initialSelectedTeam));

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('Landing');
  const [results, setResults] = useState<SimulatedGameResult[]>(initialSave?.results ?? []);
  const [playoffResults, setPlayoffResults] = useState<SimulatedGameResult[]>(initialSave?.playoffResults ?? []);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);
  const [selectedTeamState, setSelectedTeamState] = useState<Team>(initialSelectedTeam);
  const [rotationPlan, setRotationPlan] = useState<RotationPlan>(initialRotation);
  const [tactics, setTactics] = useState<TacticalSettings>(initialSave?.tactics ?? defaultTactics);
  const [savedAt, setSavedAt] = useState<string | null>(initialSave?.savedAt ?? null);
  const [trainingFocus, setTrainingFocus] = useState<TrainingFocus>(initialSave?.trainingFocus ?? 'Balanced');

  const selectedTeam = selectedTeamState.id === selectedTeamId ? selectedTeamState : getTeam(selectedTeamId);
  const rotation = normaliseRotation(selectedTeam, rotationPlan);
  const effectiveTeams = mergeTeamState(teams, selectedTeam);
  const topPlayers = [...selectedTeam.roster]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 3);
  const hasSave = Boolean(initialSave) || results.length > 0 || playoffResults.length > 0;

  useEffect(() => {
    const save = saveLocalSeason(results, tactics, playoffResults, selectedTeamId, trainingFocus, rotation, selectedTeam);
    setSavedAt(save.savedAt);
  }, [results, tactics, playoffResults, selectedTeamId, trainingFocus, rotation, selectedTeam]);

  const latestResult = playoffResults.at(-1) ?? results.at(-1) ?? null;
  const standings = calculateStandings(effectiveTeams, results);
  const userStanding = standings.find((standing) => standing.teamId === selectedTeam.id);
  const nextFixture = seasonFixtures.find((fixture) => !hasResultForFixture(fixture, results));
  const currentRound = nextFixture?.round ?? totalRounds;
  const currentRoundFixtures = getFixturesForRound(currentRound);
  const userGameResult = [...results].reverse().find((result) => result.homeTeamId === selectedTeam.id || result.awayTeamId === selectedTeam.id) ?? null;
  const userWonLatestGame = userGameResult?.winnerTeamId === selectedTeam.id;
  const boardConfidence = calculateBoardConfidence({ standings, selectedTeamId: selectedTeam.id, latestUserGame: userGameResult });
  const nextHomeTeam = nextFixture ? getTeam(nextFixture.homeTeamId, effectiveTeams) : null;
  const nextAwayTeam = nextFixture ? getTeam(nextFixture.awayTeamId, effectiveTeams) : null;
  const nextMatchupLabel = nextHomeTeam && nextAwayTeam
    ? calculateWinProbability(nextHomeTeam, nextAwayTeam, {
      homeTactics: nextHomeTeam.id === selectedTeam.id ? tactics : defaultTactics,
      awayTactics: nextAwayTeam.id === selectedTeam.id ? tactics : defaultTactics,
    }).matchupLabel
    : null;

  function resetManagedState(teamId = selectedTeamId) {
    const freshTeam = getTeam(teamId);
    setSelectedTeamState(freshTeam);
    setRotationPlan(createDefaultRotation(freshTeam));
  }

  function handleResetSeason() {
    clearLocalSeasonSave();
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setTrainingFocus('Balanced');
    resetManagedState();
  }

  function handleStartNewFranchise() {
    clearLocalSeasonSave();
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setTrainingFocus('Balanced');
    resetManagedState();
    setActiveView('Team Select');
  }

  function handleSelectTeam(teamId: string) {
    const freshTeam = getTeam(teamId);
    setSelectedTeamId(teamId);
    setSelectedTeamState(freshTeam);
    setRotationPlan(createDefaultRotation(freshTeam));
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setTrainingFocus('Balanced');
    setActiveView('Dashboard');
  }

  function simulateFixtureWithManagedState(fixture: Fixture, managedTeam: Team) {
    const localTeams = mergeTeamState(teams, managedTeam);
    const homeTeam = getTeam(fixture.homeTeamId, localTeams);
    const awayTeam = getTeam(fixture.awayTeamId, localTeams);
    const homeIsUser = homeTeam.id === selectedTeam.id;
    const awayIsUser = awayTeam.id === selectedTeam.id;
    const homeTactics = homeIsUser ? tactics : defaultTactics;
    const awayTactics = awayIsUser ? tactics : defaultTactics;
    const adjustedHome = homeIsUser ? applyTrainingFocus(homeTeam, trainingFocus) : homeTeam;
    const adjustedAway = awayIsUser ? applyTrainingFocus(awayTeam, trainingFocus) : awayTeam;
    const result = simulateGame(adjustedHome, adjustedAway, {
      homeTactics,
      awayTactics,
      homeRotation: homeIsUser ? rotation : null,
      awayRotation: awayIsUser ? rotation : null,
    });

    if (!homeIsUser && !awayIsUser) return { result, managedTeam };

    const condition = applyPostGameCondition(managedTeam, rotation, trainingFocus);
    return { result, managedTeam: condition.team };
  }

  function handleSimulateNextFixture() {
    if (!nextFixture) return;

    setResults((currentResults) => {
      if (hasResultForFixture(nextFixture, currentResults)) return currentResults;

      const simulation = simulateFixtureWithManagedState(nextFixture, selectedTeam);
      setSelectedTeamState(simulation.managedTeam);
      return [...currentResults, simulation.result];
    });
  }

  function handleSimulateCurrentRound() {
    setResults((currentResults) => {
      let managedTeam = selectedTeam;
      const newResults = currentRoundFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => {
          const simulation = simulateFixtureWithManagedState(fixture, managedTeam);
          managedTeam = simulation.managedTeam;
          return simulation.result;
        });

      setSelectedTeamState(managedTeam);
      return [...currentResults, ...newResults];
    });
  }

  function handleSimulateRestOfSeason() {
    setResults((currentResults) => {
      let managedTeam = selectedTeam;
      const newResults = seasonFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => {
          const simulation = simulateFixtureWithManagedState(fixture, managedTeam);
          managedTeam = simulation.managedTeam;
          return simulation.result;
        });

      setSelectedTeamState(managedTeam);
      return [...currentResults, ...newResults];
    });
  }

  function handleSimulatePlayoffMatchups(matchups: PlayoffMatchup[]) {
    setPlayoffResults((currentResults) => {
      const newResults = matchups
        .filter((matchup) => !currentResults.some((result) => result.homeTeamId === matchup.homeSeed.standing.teamId && result.awayTeamId === matchup.awaySeed.standing.teamId))
        .map((matchup) => simulateGame(
          getTeam(matchup.homeSeed.standing.teamId, effectiveTeams),
          getTeam(matchup.awaySeed.standing.teamId, effectiveTeams),
          {
            homeTactics: matchup.homeSeed.standing.teamId === selectedTeam.id ? tactics : defaultTactics,
            awayTactics: matchup.awaySeed.standing.teamId === selectedTeam.id ? tactics : defaultTactics,
            homeRotation: matchup.homeSeed.standing.teamId === selectedTeam.id ? rotation : null,
            awayRotation: matchup.awaySeed.standing.teamId === selectedTeam.id ? rotation : null,
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

  if (activeView === 'Landing') {
    return (
      <LandingScreen
        hasSave={hasSave}
        onContinue={() => setActiveView('Dashboard')}
        onNewFranchise={handleStartNewFranchise}
        selectedTeamName={selectedTeam.name}
      />
    );
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
            boardConfidence={boardConfidence}
            currentRound={currentRound}
            handleResetSeason={handleResetSeason}
            handleSimulateCurrentRound={handleSimulateCurrentRound}
            handleSimulateNextFixture={handleSimulateNextFixture}
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
            topPlayers={topPlayers}
            userGameResult={userGameResult}
            userStanding={userStanding}
            userWonLatestGame={userWonLatestGame}
          />
        )}

        {activeView === 'Team Select' && <TeamSelectScreen selectedTeamId={selectedTeam.id} teams={effectiveTeams} onSelectTeam={handleSelectTeam} />}
        {activeView === 'Roster' && <RosterScreen team={selectedTeam} />}
        {activeView === 'Tactics' && (
          <TacticsScreen
            team={selectedTeam}
            tactics={tactics}
            rotationPlan={rotation}
            onRotationChange={setRotationPlan}
            onTacticsChange={setTactics}
          />
        )}
        {activeView === 'Schedule' && (
          <ScheduleScreen
            currentRound={currentRound}
            fixtures={seasonFixtures}
            results={results}
            teams={effectiveTeams}
            totalRounds={totalRounds}
          />
        )}
        {activeView === 'Results' && <MatchResultScreen latestResult={latestResult} results={results} selectedTeamId={selectedTeam.id} teams={effectiveTeams} />}
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
        {activeView === 'Training' && <TrainingScreen team={selectedTeam} trainingFocus={trainingFocus} onTrainingFocusChange={setTrainingFocus} />}
        {activeView === 'Summary' && (
          <SeasonSummaryScreen
            gamesPlayed={results.length}
            playoffResults={playoffResults}
            standings={standings}
            teams={effectiveTeams}
            totalGames={seasonFixtures.length}
            userTeamId={selectedTeam.id}
          />
        )}
      </section>
    </main>
  );
}

function mergeTeamState(teamList: Team[], managedTeam: Team) {
  return teamList.map((team) => (team.id === managedTeam.id ? managedTeam : team));
}

function TeamMini({ name, colour }: { name: string; colour: string }) {
  return (
    <div className="team-mini" style={{ borderColor: colour }}>
      <span>{name}</span>
    </div>
  );
}

function ScoreBlock({ team, score, colour }: { team: string; score: number; colour: string }) {
  return (
    <div className="score-block" style={{ borderColor: colour }}>
      <span>{team}</span>
      <strong>{score}</strong>
    </div>
  );
}

type DashboardViewProps = {
  boardConfidence: number;
  currentRound: number;
  handleResetSeason: () => void;
  handleSimulateCurrentRound: () => void;
  handleSimulateNextFixture: () => void;
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
};

function DashboardView({
  boardConfidence,
  currentRound,
  handleResetSeason,
  handleSimulateCurrentRound,
  handleSimulateNextFixture,
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
                  <span>{player.teamName} · {player.minutes ?? 0} MIN · {player.rebounds} REB · {player.assists} AST</span>
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

function getTeam(teamId: string, teamList: Team[] = teams): Team {
  const team = teamList.find((candidate) => candidate.id === teamId);

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
