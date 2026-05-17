import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
import { TeamLogo } from './components/TeamLogo';
import { TrainingScreen, type TrainingFocus } from './components/TrainingScreen';
import { getFixturesForRound, seasonFixtures } from './data/fixtures';
import { teams } from './data/teams';
import { calculateStandings } from './game/calculateStandings';
import { calculateBoardConfidence } from './game/boardConfidence';
import { releasePlayer, renewPlayerContract } from './game/contracts';
import { signFreeAgent } from './game/freeAgents';
import { clearLocalSeasonSave, exportLocalSeasonSave, importLocalSeasonSave, loadLocalSeasonSave, saveLocalSeason } from './game/localSave';
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
type SimKeyEvent = 'Next My Game' | 'Playoffs Start' | 'Season End';
const SIM_KEY_EVENT_HINTS: Record<SimKeyEvent, string> = {
  'Next My Game': 'Advance until your club appears again on the schedule.',
  'Playoffs Start': 'Fast-forward through the remaining regular-season fixtures.',
  'Season End': 'Sim every remaining regular-season and playoff game.',
};

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
  const [simNotice, setSimNotice] = useState<string | null>(null);
  const [simKeyEvent, setSimKeyEvent] = useState<SimKeyEvent>('Next My Game');
  const [isSimulating, setIsSimulating] = useState(false);
  const [displayDensity, setDisplayDensity] = useState<DisplayDensity>(() => {
    if (typeof window === 'undefined') return 'Compact';
    const saved = window.localStorage.getItem('hoop-dynasty-display-density');
    return saved === 'Normal' || saved === 'Compact' || saved === 'Ultra' ? saved : 'Compact';
  });
  const [focusMode, setFocusMode] = useState<FocusMode>(() => {
    if (typeof window === 'undefined') return 'My Team';
    return window.localStorage.getItem('hoop-dynasty-focus-mode') === 'League' ? 'League' : 'My Team';
  });
  const [motionMode, setMotionMode] = useState<MotionMode>(() => {
    if (typeof window === 'undefined') return 'Standard';
    return window.localStorage.getItem('hoop-dynasty-motion-mode') === 'Reduced' ? 'Reduced' : 'Standard';
  });
  const [rngSeed, setRngSeed] = useState<number>(initialSave?.rngSeed && initialSave.rngSeed > 0 ? initialSave.rngSeed : generateSeed());
  const [backupMeta, setBackupMeta] = useState<{ savedAt: string; teamId: string } | null>(() => typeof window === 'undefined' ? null : getBackupLocalSeasonSaveMeta());
  const { rng: simulationRng, reset: resetSimulationRng, rngCallsRef } = useSimulationRng(
    initialSave?.rngSeed && initialSave.rngSeed > 0 ? initialSave.rngSeed : rngSeed,
    initialSave?.rngCalls ?? 0,
  );
  const importInputRef = useRef<HTMLInputElement | null>(null);

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
    setBackupMeta(getBackupLocalSeasonSaveMeta());
  }, [results, tactics, playoffResults, selectedTeamId, trainingFocus, rotation, selectedTeam, latestConditionReport, latestDevelopmentReport, rngSeed]);

  useEffect(() => {
    document.body.classList.remove('density-normal', 'density-compact', 'density-ultra');
    document.body.classList.add(`density-${displayDensity.toLowerCase()}`);
    window.localStorage.setItem('hoop-dynasty-display-density', displayDensity);
  }, [displayDensity]);

  useEffect(() => {
    window.localStorage.setItem('hoop-dynasty-focus-mode', focusMode);
  }, [focusMode]);

  useEffect(() => {
    document.body.style.setProperty('--team-primary', selectedTeam.primaryColor);
    document.body.style.setProperty('--team-secondary', selectedTeam.secondaryColor);
    document.body.style.setProperty('--team-tertiary', selectedTeam.tertiaryColor ?? '#38bdf8');
  }, [selectedTeam.primaryColor, selectedTeam.secondaryColor, selectedTeam.tertiaryColor]);

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

  useEffect(() => {
    if (!simNotice) return;
    const timer = window.setTimeout(() => setSimNotice(null), 900);
    return () => window.clearTimeout(timer);
  }, [results, playoffResults, simNotice]);

  function resetManagedState(teamId = selectedTeamId) {
    const freshTeam = getTeam(teamId);
    setSelectedTeamState(freshTeam);
    setRotationPlan(createDefaultRotation(freshTeam));
    setLatestConditionReport([]);
    setLatestDevelopmentReport([]);
  }

  function handleResetSeason() {
    const confirmed = window.confirm('Reset local season? This clears current save and backup data for this browser profile.');
    if (!confirmed) return;
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

  function handleExportSave() {
    const raw = exportLocalSeasonSave();
    if (!raw) {
      setSimNotice('No save found to export.');
      return;
    }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `hardwood-dynasty-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSimNotice('Save exported.');
  }

  function handleImportSave(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? importLocalSeasonSave(reader.result) : null;
      if (!result) {
        setSimNotice('Import failed. Invalid save file.');
        return;
      }
      const nextSeed = result.rngSeed > 0 ? result.rngSeed : generateSeed();
      setResults(result.results);
      setPlayoffResults(result.playoffResults);
      setSelectedTeamId(result.selectedTeamId);
      const importedTeam = result.selectedTeamState?.id === result.selectedTeamId ? result.selectedTeamState : getTeam(result.selectedTeamId);
      setSelectedTeamState(importedTeam);
      setRotationPlan(normaliseRotation(importedTeam, result.rotationPlan ?? createDefaultRotation(importedTeam)));
      setLatestConditionReport(result.latestConditionReport);
      setLatestDevelopmentReport(result.latestDevelopmentReport);
      setTactics(result.tactics);
      setSavedAt(result.savedAt);
      setTrainingFocus(result.trainingFocus);
      setRngSeed(nextSeed);
      resetSimulationRng(nextSeed);
      setActiveView('Dashboard');
      setSimNotice('Save imported.');
    };
    reader.readAsText(file);
    event.target.value = '';
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
    resetSimulationRng(nextSeed);
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

  function handleChangePlayerPosition(playerId: string, position: Player['position']) {
    setSelectedTeamState((currentTeam) => ({
      ...currentTeam,
      roster: currentTeam.roster.map((player) => (player.id === playerId ? { ...player, position } : player)),
    }));
  }

  function handleCreateCustomTeam(input: {
    baseTeamId: string;
    name: string;
    city: string;
    shortName: string;
    tier: 'Top' | 'Mid' | 'Bottom';
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    logoUrl?: string;
    miniLogoUrl?: string;
  }) {
    const baseTeam = getTeam(input.baseTeamId);
    const tierReputation = input.tier === 'Top' ? 82 : input.tier === 'Mid' ? 72 : 62;
    const overallDelta = input.tier === 'Top' ? 4 : input.tier === 'Mid' ? 0 : -4;
    const customTeam: Team = {
      ...baseTeam,
      id: baseTeam.id,
      name: input.name,
      city: input.city,
      shortName: input.shortName.toUpperCase().slice(0, 3),
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      tertiaryColor: input.tertiaryColor,
      logoUrl: input.logoUrl,
      miniLogoUrl: input.miniLogoUrl,
      reputation: tierReputation,
      identity: `${input.tier} tier expansion club`,
      legacyStory: `${input.name} are a newly-controlled custom franchise slot.`,
      roster: baseTeam.roster.map((player) => ({
        ...player,
        overall: Math.max(55, Math.min(92, player.overall + overallDelta)),
        potential: Math.max(player.overall + overallDelta + 2, Math.min(95, player.potential + overallDelta)),
      })),
    };
    setSelectedTeamId(baseTeam.id);
    setSelectedTeamState(customTeam);
    setRotationPlan(createDefaultRotation(customTeam));
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
      rng: simulationRng,
    });

    if (!homeIsUser && !awayIsUser) return { result, managedTeam, conditionReport: latestConditionReport, developmentReport: latestDevelopmentReport };

    const condition = applyPostGameCondition(managedTeam, rotation, trainingFocus);
    const development = applyPostGameDevelopment(condition.team, rotation);
    return { result, managedTeam: development.team, conditionReport: condition.changes, developmentReport: development.changes };
  }

  function simulateFixturesBatch(
    currentResults: SimulatedGameResult[],
    fixtures: Fixture[],
    stopAfter?: (fixture: Fixture) => boolean,
  ) {
    if (fixtures.length === 0) {
      return {
        newResults: [] as SimulatedGameResult[],
        managedTeam: selectedTeam,
        conditionReport: latestConditionReport,
        developmentReport: latestDevelopmentReport,
      };
    }

    let managedTeam = selectedTeam;
    let conditionReport = latestConditionReport;
    let developmentReport = latestDevelopmentReport;
    const newResults: SimulatedGameResult[] = [];

    for (const fixture of fixtures) {
      if (hasResultForFixture(fixture, currentResults)) continue;
      const simulation = simulateFixtureWithManagedState(fixture, managedTeam);
      managedTeam = simulation.managedTeam;
      conditionReport = simulation.conditionReport;
      developmentReport = simulation.developmentReport;
      newResults.push(simulation.result);
      if (stopAfter?.(fixture)) break;
    }

    return { newResults, managedTeam, conditionReport, developmentReport };
  }

  function runSimAction(action: () => void) {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      action();
    } finally {
      window.setTimeout(() => setIsSimulating(false), 0);
    }
  }

  function handleSimulateNextFixture() {
    if (isSimulating) return;
    if (!nextFixture) return;
    runSimAction(() => {
      setSimNotice('Simulating next fixture...');
      setResults((currentResults) => {
        if (hasResultForFixture(nextFixture, currentResults)) return currentResults;

        const simulation = simulateFixtureWithManagedState(nextFixture, selectedTeam);
        setSelectedTeamState(simulation.managedTeam);
        setLatestConditionReport(simulation.conditionReport);
        setLatestDevelopmentReport(simulation.developmentReport);
        return [...currentResults, simulation.result];
      });
    });
  }

  function handleSimulateCurrentRound() {
    if (isSimulating) return;
    runSimAction(() => {
      setSimNotice(`Simulating round ${currentRound}...`);
      setResults((currentResults) => {
        const { newResults, managedTeam, conditionReport, developmentReport } = simulateFixturesBatch(currentResults, currentRoundFixtures);

        if (newResults.length === 0) return currentResults;
        setSelectedTeamState(managedTeam);
        setLatestConditionReport(conditionReport);
        setLatestDevelopmentReport(developmentReport);
        return [...currentResults, ...newResults];
      });
    });
  }

  function handleSimulateRestOfSeason() {
    if (isSimulating) return;
    runSimAction(() => {
      setSimNotice('Simulating rest of regular season...');
      setResults((currentResults) => {
        const { newResults, managedTeam, conditionReport, developmentReport } = simulateFixturesBatch(currentResults, seasonFixtures);

        if (newResults.length === 0) return currentResults;
        setSelectedTeamState(managedTeam);
        setLatestConditionReport(conditionReport);
        setLatestDevelopmentReport(developmentReport);
        return [...currentResults, ...newResults];
      });
    });
  }

  function handleSimulateToNextMyGame() {
    if (isSimulating) return;
    runSimAction(() => {
      setSimNotice('Simulating to next user game...');
      setResults((currentResults) => {
        const { newResults, managedTeam, conditionReport, developmentReport } = simulateFixturesBatch(
          currentResults,
          seasonFixtures,
          (fixture) => fixture.homeTeamId === selectedTeam.id || fixture.awayTeamId === selectedTeam.id,
        );

        if (newResults.length > 0) {
          setSelectedTeamState(managedTeam);
          setLatestConditionReport(conditionReport);
          setLatestDevelopmentReport(developmentReport);
        }

        return [...currentResults, ...newResults];
      });
    });
  }

  function handleSimulateToKeyEvent() {
    if (isSimulating) return;
    if (simKeyEvent === 'Next My Game') {
      handleSimulateToNextMyGame();
      return;
    }

    if (simKeyEvent === 'Season End') {
      handleSimulateRestOfSeason();
      return;
    }

    runSimAction(() => {
      setSimNotice('Simulating to playoffs start...');
      setResults((currentResults) => {
        const regularSeasonComplete = seasonFixtures.every((fixture) => hasResultForFixture(fixture, currentResults));
        if (regularSeasonComplete) return currentResults;
        const { newResults, managedTeam, conditionReport, developmentReport } = simulateFixturesBatch(currentResults, seasonFixtures);
        if (newResults.length === 0) return currentResults;
        setSelectedTeamState(managedTeam);
        setLatestConditionReport(conditionReport);
        setLatestDevelopmentReport(developmentReport);
        return [...currentResults, ...newResults];
      });
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
    setSimNotice('Simulating quarter finals...');
    handleSimulatePlayoffMatchups(createQuarterFinalMatchups(standings));
  }

  function handleSimulateSemiFinals() {
    setSimNotice('Simulating semi finals...');
    handleSimulatePlayoffMatchups(createSemiFinalMatchups(standings, playoffResults));
  }

  function handleSimulateFinal() {
    const final = createFinalMatchup(standings, playoffResults);

    if (!final) return;

    setSimNotice('Simulating final...');
    handleSimulatePlayoffMatchups([final]);
  }

  if (activeView === 'Landing') {
    return (
      <LandingScreen
        hasSave={hasSave}
        selectedTeamName={selectedTeam.name}
        onContinue={() => setActiveView(hasSave ? 'Dashboard' : 'Team Select')}
        onNewFranchise={handleStartNewFranchise}
      />
    );
  }

  return (
    <main className="app-shell">
      <input ref={importInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportSave} />
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <TeamLogo teamId={selectedTeam.id} teamName={selectedTeam.name} logoSrc={selectedTeam.miniLogoUrl ?? selectedTeam.logoUrl} size={28} />
          </div>
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
        <div className="density-switcher panel">
          <p className="eyebrow">Motion</p>
          <div className="option-row">
            {(['Standard', 'Reduced'] as const).map((mode) => (
              <button
                className={motionMode === mode ? 'option-button active' : 'option-button'}
                key={mode}
                onClick={() => setMotionMode(mode)}
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
        <article className="panel" style={{ marginTop: '0.6rem' }}>
          <p className="eyebrow">Quick Help</p>
          <div className="assistant-notes">
            <div className="assistant-note"><strong>OVR</strong><span>Current player level right now.</span></div>
            <div className="assistant-note"><strong>POT</strong><span>Projected ceiling with development.</span></div>
            <div className="assistant-note"><strong>Board Confidence</strong><span>Low confidence increases pressure and risk.</span></div>
          </div>
        </article>
      </aside>

      <section className="content-area">
        <header className="hero-card">
          <div>
            <p className="eyebrow">British Super Basketball League · {selectedTeam.nation}</p>
            <h2>{selectedTeam.name}</h2>
            <p className="hero-copy">{selectedTeam.identity}. Built for {selectedTeam.playStyle.toLowerCase()} basketball.</p>
          </div>
          <div className="team-badge" style={{ borderColor: selectedTeam.primaryColor }}>
            <TeamLogo
              teamId={selectedTeam.id}
              teamName={selectedTeam.name}
              logoSrc={selectedTeam.logoUrl ?? selectedTeam.miniLogoUrl}
              size={44}
            />
          </div>
        </header>

        {activeView === 'Dashboard' && (
          <DashboardView
            boardConfidence={boardConfidence}
            currentRound={currentRound}
            diagnostics={diagnostics}
            developmentReady={developmentReady}
            handleResetSeason={handleResetSeason}
            handleExportSave={handleExportSave}
            handleOpenImportSave={() => importInputRef.current?.click()}
            handleSimulateCurrentRound={handleSimulateCurrentRound}
            handleSimulateNextFixture={handleSimulateNextFixture}
            handleSimulateRestOfSeason={handleSimulateRestOfSeason}
            handleSimulateToKeyEvent={handleSimulateToKeyEvent}
            handleSimulateToNextMyGame={handleSimulateToNextMyGame}
            isSimulating={isSimulating}
            latestResult={latestResult}
            nextAwayTeam={nextAwayTeam}
            nextFixture={nextFixture}
            nextHomeTeam={nextHomeTeam}
            nextMatchupLabel={nextMatchupLabel}
            results={results}
            savedAt={savedAt}
            backupMeta={backupMeta}
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
            simKeyEvent={simKeyEvent}
            simNotice={simNotice}
            setSimKeyEvent={setSimKeyEvent}
            userStanding={userStanding}
            userWonLatestGame={userWonLatestGame}
          />
        )}
        {activeView === 'Inbox' && (
          <InboxScreen
            boardConfidence={boardConfidence}
            currentRound={currentRound}
            latestConditionReport={latestConditionReport}
            latestDevelopmentReport={latestDevelopmentReport}
            latestResult={latestResult}
            nextAwayTeam={nextAwayTeam}
            nextHomeTeam={nextHomeTeam}
            selectedTeam={selectedTeam}
            standings={standings}
            userStanding={userStanding}
            focusMode={focusMode}
            onNavigate={(view) => setActiveView(view)}
          />
        )}

        {activeView === 'Team Select' && <TeamSelectScreen selectedTeamId={selectedTeam.id} teams={effectiveTeams} onSelectTeam={handleSelectTeam} onCreateCustomTeam={handleCreateCustomTeam} />}
        {activeView === 'Roster' && <RosterScreen team={selectedTeam} results={results} onChangePlayerPosition={handleChangePlayerPosition} />}
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
            focusMode={focusMode}
          />
        )}
        {activeView === 'League' && (
          <LeagueScreen
            gamesPlayed={results.length}
            standings={standings}
            totalGames={seasonFixtures.length}
            userTeamId={selectedTeam.id}
            focusMode={focusMode}
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
  handleExportSave: () => void;
  handleOpenImportSave: () => void;
  handleSimulateCurrentRound: () => void;
  handleSimulateNextFixture: () => void;
  handleSimulateRestOfSeason: () => void;
  handleSimulateToKeyEvent: () => void;
  handleSimulateToNextMyGame: () => void;
  isSimulating: boolean;
  latestResult: SimulatedGameResult | null;
  nextAwayTeam: Team | null;
  nextFixture: Fixture | undefined;
  nextHomeTeam: Team | null;
  nextMatchupLabel: string | null;
  results: SimulatedGameResult[];
  savedAt: string | null;
  backupMeta: { savedAt: string; teamId: string } | null;
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
  simKeyEvent: SimKeyEvent;
  simNotice: string | null;
  setSimKeyEvent: (event: SimKeyEvent) => void;
  userStanding: ReturnType<typeof calculateStandings>[number] | undefined;
  userWonLatestGame: boolean;
};

function DashboardView({
  boardConfidence,
  currentRound,
  developmentReady,
  diagnostics,
  handleResetSeason,
  handleExportSave,
  handleOpenImportSave,
  handleSimulateCurrentRound,
  handleSimulateNextFixture,
  handleSimulateRestOfSeason,
  handleSimulateToKeyEvent,
  handleSimulateToNextMyGame,
  isSimulating,
  latestResult,
  nextAwayTeam,
  nextFixture,
  nextHomeTeam,
  nextMatchupLabel,
  results,
  savedAt,
  backupMeta,
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
  simKeyEvent,
  simNotice,
  setSimKeyEvent,
  userStanding,
  userWonLatestGame,
}: DashboardViewProps) {
  return (
    <section className="dashboard-grid">
      <article className="panel next-game-panel">
        <p className="eyebrow">Next Fixture</p>
        {simNotice && <span className="chip">{simNotice}</span>}
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
            <button className="primary-action" disabled={isSimulating} onClick={handleSimulateNextFixture}>{isSimulating ? 'Simulating...' : 'Simulate Next Fixture'}</button>
            <button className="secondary-action" disabled={isSimulating} onClick={handleSimulateCurrentRound}>Simulate Round {currentRound}</button>
            <button className="secondary-action" disabled={isSimulating} onClick={handleSimulateToNextMyGame}>Simulate To Next My Game</button>
            <div className="option-row">
              <select
                aria-label="Select simulation target"
                value={simKeyEvent}
                onChange={(event) => setSimKeyEvent(event.target.value as SimKeyEvent)}
              >
                {(['Next My Game', 'Playoffs Start', 'Season End'] as const).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button className="secondary-action" disabled={isSimulating} onClick={handleSimulateToKeyEvent}>Simulate To Key Event</button>
            </div>
            <p className="muted">{SIM_KEY_EVENT_HINTS[simKeyEvent]}</p>
            <button className="secondary-action" disabled={isSimulating} onClick={handleSimulateRestOfSeason}>Simulate Rest of Season</button>
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
        <div className="option-row" style={{ marginBottom: '0.75rem' }}>
          <button className="option-button" onClick={handleExportSave}>Export Save</button>
          <button className="option-button" onClick={handleOpenImportSave}>Import Save</button>
        </div>
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

      <h2>League Standings</h2>
      <table border={1}>
        <thead><tr><th>Rank</th><th>Team</th><th>W</th><th>L</th><th>PCT</th></tr></thead>
        <tbody>
          {standings.map((t, idx) => <tr key={t.teamId}><td>{idx + 1}</td><td>{t.teamName}</td><td>{t.wins}</td><td>{t.losses}</td><td>{t.winPercentage.toFixed(3)}</td></tr>)}
        </tbody>
      </table>

      <p>Total Games Simulated: {results.length}</p>
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
