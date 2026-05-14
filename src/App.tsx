import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Banknote, BarChart3, CalendarDays, ClipboardList, Dumbbell, FileText, Inbox, Medal, ScrollText, Shield, Trophy, TrendingUp, UserPlus, Users } from 'lucide-react';
import { BoardFinanceScreen } from './components/BoardFinanceScreen';
import { ContractsScreen } from './components/ContractsScreen';
import { DevelopmentScreen } from './components/DevelopmentScreen';
import { FreeAgentsScreen } from './components/FreeAgentsScreen';
import { InboxScreen } from './components/InboxScreen';
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
import { calculateBoardConfidence } from './game/boardConfidence';
import { releasePlayer, renewPlayerContract } from './game/contracts';
import { signFreeAgent } from './game/freeAgents';
import { clearLocalSeasonSave, loadLocalSeasonSave, saveLocalSeason } from './game/localSave';
import { applyPostGameCondition } from './game/playerCondition';
import { applyPostGameDevelopment } from './game/playerDevelopment';
import { applyTrainingFocus } from './game/training';
import { createFinalMatchup, createQuarterFinalMatchups, createSemiFinalMatchups, type PlayoffMatchup } from './game/playoffs';
import { createDefaultRotation, normaliseRotation } from './game/rotation';
import { generateSeed } from './game/rng';
import { runSimulationHarness } from './game/simulationHarness';
import { calculateSimulationDiagnostics } from './game/simulationDiagnostics';
import { useSimulationRng } from './game/useSimulationRng';
import { simulateGame, type SimulatedGameResult } from './game/simulateGame';
import { defaultTactics, type TacticalSettings } from './game/tactics';
import { calculateWinProbability } from './game/winProbability';
import type { Fixture, Player, PlayerConditionChange, PlayerDevelopmentChange, RotationPlan, Team } from './types/basketball';

type ActiveView = 'Landing' | 'Dashboard' | 'Inbox' | 'Team Select' | 'Roster' | 'Development' | 'Contracts' | 'Free Agents' | 'Board & Finance' | 'Tactics' | 'Schedule' | 'Results' | 'League' | 'Playoffs' | 'Summary' | 'Training';
type DisplayDensity = 'Normal' | 'Compact' | 'Ultra';
type FocusMode = 'My Team' | 'League';

const navItems = [
  { label: 'Dashboard', icon: Activity, enabled: true },
  { label: 'Inbox', icon: Inbox, enabled: true },
  { label: 'Team Select', icon: Users, enabled: true },
  { label: 'Roster', icon: Users, enabled: true },
  { label: 'Development', icon: TrendingUp, enabled: true },
  { label: 'Contracts', icon: ScrollText, enabled: true },
  { label: 'Free Agents', icon: UserPlus, enabled: true },
  { label: 'Board & Finance', icon: Banknote, enabled: true },
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
  const [latestConditionReport, setLatestConditionReport] = useState<PlayerConditionChange[]>(initialSave?.latestConditionReport ?? []);
  const [latestDevelopmentReport, setLatestDevelopmentReport] = useState<PlayerDevelopmentChange[]>(initialSave?.latestDevelopmentReport ?? []);
  const [tactics, setTactics] = useState<TacticalSettings>(initialSave?.tactics ?? defaultTactics);
  const [savedAt, setSavedAt] = useState<string | null>(initialSave?.savedAt ?? null);
  const [trainingFocus, setTrainingFocus] = useState<TrainingFocus>(initialSave?.trainingFocus ?? 'Balanced');
  const [displayDensity, setDisplayDensity] = useState<DisplayDensity>(() => {
    if (typeof window === 'undefined') return 'Compact';
    const saved = window.localStorage.getItem('hoop-dynasty-display-density');
    return saved === 'Normal' || saved === 'Compact' || saved === 'Ultra' ? saved : 'Compact';
  });
  const [focusMode, setFocusMode] = useState<FocusMode>(() => {
    if (typeof window === 'undefined') return 'My Team';
    return window.localStorage.getItem('hoop-dynasty-focus-mode') === 'League' ? 'League' : 'My Team';
  });
  const [rngSeed, setRngSeed] = useState<number>(initialSave?.rngSeed && initialSave.rngSeed > 0 ? initialSave.rngSeed : generateSeed());
  const { rng: simulationRng, reset: resetSimulationRng, rngCallsRef } = useSimulationRng(
    initialSave?.rngSeed && initialSave.rngSeed > 0 ? initialSave.rngSeed : rngSeed,
    initialSave?.rngCalls ?? 0,
  );

  const selectedTeam = selectedTeamState.id === selectedTeamId ? selectedTeamState : getTeam(selectedTeamId);
  const rotation = normaliseRotation(selectedTeam, rotationPlan);
  const effectiveTeams = mergeTeamState(teams, selectedTeam);
  const signedFreeAgentIds = selectedTeam.roster.filter((player) => player.id.startsWith('fa-')).map((player) => player.id);
  const topPlayers = [...selectedTeam.roster]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 3);
  const hasSave = Boolean(initialSave) || results.length > 0 || playoffResults.length > 0;

  useEffect(() => {
    const save = saveLocalSeason(results, tactics, playoffResults, selectedTeamId, trainingFocus, rotation, selectedTeam, latestConditionReport, latestDevelopmentReport, rngSeed, rngCallsRef.current);
    setSavedAt(save.savedAt);
  }, [results, tactics, playoffResults, selectedTeamId, trainingFocus, rotation, selectedTeam, latestConditionReport, latestDevelopmentReport, rngSeed]);

  useEffect(() => {
    document.body.classList.remove('density-normal', 'density-compact', 'density-ultra');
    document.body.classList.add(`density-${displayDensity.toLowerCase()}`);
    window.localStorage.setItem('hoop-dynasty-display-density', displayDensity);
  }, [displayDensity]);

  useEffect(() => {
    window.localStorage.setItem('hoop-dynasty-focus-mode', focusMode);
  }, [focusMode]);

  const latestResult = [...playoffResults, ...results]
    .reverse()
    .find((result) => result.homeTeamId === selectedTeam.id || result.awayTeamId === selectedTeam.id) ?? null;
  const standings = calculateStandings(effectiveTeams, results);
  const userStanding = standings.find((standing) => standing.teamId === selectedTeam.id);
  const nextFixture = seasonFixtures.find((fixture) => {
    if (hasResultForFixture(fixture, results)) return false;
    return fixture.homeTeamId === selectedTeam.id || fixture.awayTeamId === selectedTeam.id;
  });
  const currentRound = nextFixture?.round ?? totalRounds;
  const currentRoundFixtures = getFixturesForRound(currentRound);
  const userGameResult = [...results].reverse().find((result) => result.homeTeamId === selectedTeam.id || result.awayTeamId === selectedTeam.id) ?? null;
  const userWonLatestGame = userGameResult?.winnerTeamId === selectedTeam.id;
  const boardConfidence = calculateBoardConfidence({
    standings,
    selectedTeamId: selectedTeam.id,
    latestUserGame: userGameResult,
    results,
    selectedTeam,
  });
  const diagnostics = useMemo(() => calculateSimulationDiagnostics(results, selectedTeam.id), [results, selectedTeam.id]);
  const tiredCount = selectedTeam.roster.filter((player) => (player.fatigue ?? 0) >= 65).length;
  const injuredCount = selectedTeam.roster.filter((player) => Boolean(player.injury)).length;
  const developmentReady = selectedTeam.roster.filter((player) => (player.developmentProgress ?? 0) >= 75 && player.overall < player.potential).length;
  const managerTasks = [
    tiredCount > 0 ? `${tiredCount} player${tiredCount === 1 ? '' : 's'} on fatigue watch` : null,
    injuredCount > 0 ? `${injuredCount} injury case${injuredCount === 1 ? '' : 's'} need minute protection` : null,
    developmentReady > 0 ? `${developmentReady} prospect${developmentReady === 1 ? '' : 's'} near OVR growth` : null,
    boardConfidence < 55 ? 'Board pressure increasing — prioritise results' : null,
  ].filter(Boolean) as string[];
  const seasonObjective = getSeasonObjective(selectedTeam.reputation);
  const objectiveProgress = getObjectiveProgress(standings, selectedTeam.id, seasonObjective.targetRank);
  const scheduleFixtures = focusMode === 'My Team'
    ? seasonFixtures.filter((fixture) => fixture.homeTeamId === selectedTeam.id || fixture.awayTeamId === selectedTeam.id)
    : seasonFixtures;
  const nextHomeTeam = nextFixture ? getTeam(nextFixture.homeTeamId, effectiveTeams) : null;
  const nextAwayTeam = nextFixture ? getTeam(nextFixture.awayTeamId, effectiveTeams) : null;
  const nextMatchupLabel = nextHomeTeam && nextAwayTeam
    ? calculateWinProbability(nextHomeTeam, nextAwayTeam, {
      homeTactics: nextHomeTeam.id === selectedTeam.id ? tactics : defaultTactics,
      awayTactics: nextAwayTeam.id === selectedTeam.id ? tactics : defaultTactics,
    }).matchupLabel
    : null;

  useEffect(() => {
    if (import.meta.env.DEV && diagnostics.games > 0) {
      console.info('[Sim Diagnostics]', diagnostics);
    }
  }, [diagnostics]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info('[Sim Harness 500 games]', runSimulationHarness(500, rngSeed));
    }
  }, [rngSeed]);

  function resetManagedState(teamId = selectedTeamId) {
    const freshTeam = getTeam(teamId);
    setSelectedTeamState(freshTeam);
    setRotationPlan(createDefaultRotation(freshTeam));
    setLatestConditionReport([]);
    setLatestDevelopmentReport([]);
  }

  function handleResetSeason() {
    clearLocalSeasonSave();
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setTrainingFocus('Balanced');
    const nextSeed = generateSeed();
    setRngSeed(nextSeed);
    resetSimulationRng(nextSeed);
    resetManagedState();
  }

  function handleStartNewFranchise() {
    clearLocalSeasonSave();
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setTrainingFocus('Balanced');
    const nextSeed = generateSeed();
    setRngSeed(nextSeed);
    resetSimulationRng(nextSeed);
    resetManagedState();
    setActiveView('Team Select');
  }

  function handleSelectTeam(teamId: string) {
    const freshTeam = getTeam(teamId);
    setSelectedTeamId(teamId);
    setSelectedTeamState(freshTeam);
    setRotationPlan(createDefaultRotation(freshTeam));
    setLatestConditionReport([]);
    setLatestDevelopmentReport([]);
    setResults([]);
    setPlayoffResults([]);
    setTactics(defaultTactics);
    setSavedAt(null);
    setTrainingFocus('Balanced');
    const nextSeed = generateSeed();
    setRngSeed(nextSeed);
    rngCallsRef.current = 0;
    simulationRngBase.current = createSeededRng(nextSeed);
    simulationRng.current = () => {
      rngCallsRef.current += 1;
      return simulationRngBase.current();
    };
    setActiveView('Dashboard');
  }

  function handleRenewContract(playerId: string) {
    setSelectedTeamState((currentTeam) => renewPlayerContract(currentTeam, playerId));
  }

  function handleReleasePlayer(playerId: string) {
    setSelectedTeamState((currentTeam) => releasePlayer(currentTeam, playerId));
  }

  function handleSignFreeAgent(player: Player) {
    setSelectedTeamState((currentTeam) => signFreeAgent(currentTeam, player));
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
      rng: simulationRng,
    });

    if (!homeIsUser && !awayIsUser) return { result, managedTeam, conditionReport: latestConditionReport, developmentReport: latestDevelopmentReport };

    const condition = applyPostGameCondition(managedTeam, rotation, trainingFocus);
    const development = applyPostGameDevelopment(condition.team, rotation);
    return { result, managedTeam: development.team, conditionReport: condition.changes, developmentReport: development.changes };
  }

  function handleSimulateNextFixture() {
    if (!nextFixture) return;

    setResults((currentResults) => {
      if (hasResultForFixture(nextFixture, currentResults)) return currentResults;

      const simulation = simulateFixtureWithManagedState(nextFixture, selectedTeam);
      setSelectedTeamState(simulation.managedTeam);
      setLatestConditionReport(simulation.conditionReport);
      setLatestDevelopmentReport(simulation.developmentReport);
      return [...currentResults, simulation.result];
    });
  }

  function handleSimulateCurrentRound() {
    setResults((currentResults) => {
      let managedTeam = selectedTeam;
      let conditionReport = latestConditionReport;
      let developmentReport = latestDevelopmentReport;
      const newResults = currentRoundFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => {
          const simulation = simulateFixtureWithManagedState(fixture, managedTeam);
          managedTeam = simulation.managedTeam;
          conditionReport = simulation.conditionReport;
          developmentReport = simulation.developmentReport;
          return simulation.result;
        });

      setSelectedTeamState(managedTeam);
      setLatestConditionReport(conditionReport);
      setLatestDevelopmentReport(developmentReport);
      return [...currentResults, ...newResults];
    });
  }

  function handleSimulateRestOfSeason() {
    setResults((currentResults) => {
      let managedTeam = selectedTeam;
      let conditionReport = latestConditionReport;
      let developmentReport = latestDevelopmentReport;
      const newResults = seasonFixtures
        .filter((fixture) => !hasResultForFixture(fixture, currentResults))
        .map((fixture) => {
          const simulation = simulateFixtureWithManagedState(fixture, managedTeam);
          managedTeam = simulation.managedTeam;
          conditionReport = simulation.conditionReport;
          developmentReport = simulation.developmentReport;
          return simulation.result;
        });

      setSelectedTeamState(managedTeam);
      setLatestConditionReport(conditionReport);
      setLatestDevelopmentReport(developmentReport);
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
            rng: simulationRng,
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

        <div className="density-switcher panel">
          <p className="eyebrow">Display</p>
          <div className="option-row">
            {(['Normal', 'Compact', 'Ultra'] as const).map((mode) => (
              <button
                className={displayDensity === mode ? 'option-button active' : 'option-button'}
                key={mode}
                onClick={() => setDisplayDensity(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="density-switcher panel">
          <p className="eyebrow">Focus</p>
          <div className="option-row">
            {(['My Team', 'League'] as const).map((mode) => (
              <button
                className={focusMode === mode ? 'option-button active' : 'option-button'}
                key={mode}
                onClick={() => setFocusMode(mode)}
              >
                {mode}
              </button>
            ))}
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
                <Icon size={16} />
                <span className="nav-label">{item.label}</span>
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
            diagnostics={diagnostics}
            developmentReady={developmentReady}
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
            tiredCount={tiredCount}
            injuredCount={injuredCount}
            standings={standings}
            tactics={tactics}
            topPlayers={topPlayers}
            managerTasks={managerTasks}
            seasonObjective={seasonObjective}
            objectiveProgress={objectiveProgress}
            userGameResult={userGameResult}
            userStanding={userStanding}
            userWonLatestGame={userWonLatestGame}
          />
        )}
        {activeView === 'Inbox' && (
          <InboxScreen
            boardConfidence={boardConfidence}
            latestConditionReport={latestConditionReport}
            latestDevelopmentReport={latestDevelopmentReport}
            latestResult={latestResult}
            nextAwayTeam={nextAwayTeam}
            nextHomeTeam={nextHomeTeam}
            selectedTeam={selectedTeam}
            standings={standings}
            userStanding={userStanding}
            onNavigate={(view) => setActiveView(view)}
          />
        )}

        {activeView === 'Team Select' && <TeamSelectScreen selectedTeamId={selectedTeam.id} teams={effectiveTeams} onSelectTeam={handleSelectTeam} />}
        {activeView === 'Roster' && <RosterScreen team={selectedTeam} />}
        {activeView === 'Development' && <DevelopmentScreen latestDevelopmentReport={latestDevelopmentReport} team={selectedTeam} />}
        {activeView === 'Contracts' && <ContractsScreen team={selectedTeam} onReleasePlayer={handleReleasePlayer} onRenewContract={handleRenewContract} />}
        {activeView === 'Free Agents' && <FreeAgentsScreen signedFreeAgentIds={signedFreeAgentIds} team={selectedTeam} onSignFreeAgent={handleSignFreeAgent} />}
        {activeView === 'Board & Finance' && <BoardFinanceScreen boardConfidence={boardConfidence} selectedTeam={selectedTeam} standings={standings} userStanding={userStanding} />}
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
            fixtures={scheduleFixtures}
            focusMode={focusMode}
            results={results}
            selectedTeamId={selectedTeam.id}
            teams={effectiveTeams}
            totalRounds={totalRounds}
          />
        )}
        {activeView === 'Results' && (
          <MatchResultScreen
            latestConditionReport={latestConditionReport}
            latestResult={latestResult}
            results={results}
            selectedTeamId={selectedTeam.id}
            teams={effectiveTeams}
          />
        )}
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
  developmentReady: number;
  diagnostics: ReturnType<typeof calculateSimulationDiagnostics>;
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
  tiredCount: number;
  injuredCount: number;
  standings: ReturnType<typeof calculateStandings>;
  tactics: TacticalSettings;
  topPlayers: Team['roster'];
  managerTasks: string[];
  seasonObjective: { title: string; targetRank: number; summary: string };
  objectiveProgress: number;
  userGameResult: SimulatedGameResult | null;
  userStanding: ReturnType<typeof calculateStandings>[number] | undefined;
  userWonLatestGame: boolean;
};

function DashboardView({
  boardConfidence,
  currentRound,
  developmentReady,
  diagnostics,
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
  tiredCount,
  injuredCount,
  standings,
  tactics,
  topPlayers,
  managerTasks,
  seasonObjective,
  objectiveProgress,
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

      <article className="panel stat-panel">
        <p className="eyebrow">Sim Health</p>
        <strong>{diagnostics.games ? Math.round(diagnostics.averageCombinedScore) : '—'}</strong>
        <span className="muted">
          {diagnostics.games
            ? `Home W ${Math.round(diagnostics.homeWinRate * 100)}% · Upsets ${Math.round(diagnostics.upsetRate * 100)}% · Blowouts ${Math.round(diagnostics.blowoutRate * 100)}%`
            : 'No games simulated yet'}
        </span>
      </article>

      <article className="panel stat-panel">
        <p className="eyebrow">Team Snapshot</p>
        <strong>{injuredCount + tiredCount}</strong>
        <span className="muted">{injuredCount} injured · {tiredCount} tired · {developmentReady} near growth</span>
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

      <article className="panel wide-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Manager Tasks</p>
            <h3>Recommended next moves</h3>
          </div>
          <span className="chip">{managerTasks.length || 1} item{managerTasks.length === 1 ? '' : 's'}</span>
        </div>
        <div className="assistant-notes">
          {(managerTasks.length ? managerTasks : ['No urgent tasks — keep momentum and monitor fatigue']).map((task) => (
            <div className="assistant-note" key={task}>
              <strong>Action</strong>
              <span>{task}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel wide-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Season Objective</p>
            <h3>{seasonObjective.title}</h3>
          </div>
          <span className="chip">{Math.round(objectiveProgress)}%</span>
        </div>
        <p className="muted">{seasonObjective.summary}</p>
        <div className="meter-cell" aria-label={`Objective progress ${Math.round(objectiveProgress)} percent`}>
          <div className="meter-track">
            <div className="meter-fill" style={{ width: `${Math.max(0, Math.min(100, objectiveProgress))}%` }} />
          </div>
        </div>
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

function getSeasonObjective(reputation: number) {
  if (reputation >= 82) {
    return { title: 'Title Push', targetRank: 2, summary: 'Board expects a top-2 finish and deep playoff run.' };
  }
  if (reputation >= 74) {
    return { title: 'Playoff Lock', targetRank: 4, summary: 'Board expects a stable playoff seed and positive momentum.' };
  }
  return { title: 'Build Year', targetRank: 6, summary: 'Board expects competitive progress and squad development.' };
}

function getObjectiveProgress(
  standings: ReturnType<typeof calculateStandings>,
  selectedTeamId: string,
  targetRank: number,
) {
  const teamIndex = standings.findIndex((standing) => standing.teamId === selectedTeamId);
  if (teamIndex === -1) return 0;

  const rank = teamIndex + 1;
  if (rank <= targetRank) return 100;

  const distance = rank - targetRank;
  return Math.max(0, 100 - distance * 15);
}
