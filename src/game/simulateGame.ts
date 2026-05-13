import { defaultTactics, type TacticalSettings } from './tactics';
import { calculateWinProbability } from './winProbability';
import { getRotationEntry, normaliseRotation } from './rotation';
import type { Player, RotationPlan, Team } from '../types/basketball';

export type PlayerBoxScore = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
};

export type SimulatedGameResult = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winnerTeamId: string;
  matchupLabel: string;
  homeBoxScore?: PlayerBoxScore[];
  awayBoxScore?: PlayerBoxScore[];
  topPerformers: PlayerBoxScore[];
  summary: string;
};

type SimulateGameOptions = {
  homeTactics?: TacticalSettings;
  awayTactics?: TacticalSettings;
  homeRotation?: RotationPlan | null;
  awayRotation?: RotationPlan | null;
  rng?: () => number;
};

export function simulateGame(homeTeam: Team, awayTeam: Team, options: SimulateGameOptions = {}): SimulatedGameResult {
  const homeTactics = options.homeTactics ?? defaultTactics;
  const rng = options.rng ?? Math.random;
  const awayTactics = options.awayTactics ?? defaultTactics;
  const homeModifier = getTacticalModifier(homeTactics);
  const awayModifier = getTacticalModifier(awayTactics);
  const homeRotation = options.homeRotation ? normaliseRotation(homeTeam, options.homeRotation) : null;
  const awayRotation = options.awayRotation ? normaliseRotation(awayTeam, options.awayRotation) : null;
  const winProbability = calculateWinProbability(homeTeam, awayTeam, { homeTactics, awayTactics });
  const homeWins = rng() <= winProbability.homeWinProbability;
  const winnerTeamId = homeWins ? homeTeam.id : awayTeam.id;
  const homeStrength = calculateTeamStrength(homeTeam, homeRotation) + 3 + homeModifier.strengthBonus;
  const awayStrength = calculateTeamStrength(awayTeam, awayRotation) + awayModifier.strengthBonus;
  const scores = createProbabilityAwareScoreline({
    rng,
    awayModifier,
    awayStrength,
    awayTeam,
    homeModifier,
    homeStrength,
    homeTeam,
    homeWins,
  });

  const homeBoxScore = createTeamBoxScore(homeTeam, scores.homeScore, homeModifier, homeTactics, rng, homeRotation);
  const awayBoxScore = createTeamBoxScore(awayTeam, scores.awayScore, awayModifier, awayTactics, rng, awayRotation);
  const topPerformers = [...homeBoxScore, ...awayBoxScore]
    .sort((a, b) => b.points + b.rebounds + b.assists - (a.points + a.rebounds + a.assists))
    .slice(0, 5);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: scores.homeScore,
    awayScore: scores.awayScore,
    winnerTeamId,
    matchupLabel: winProbability.matchupLabel,
    homeBoxScore,
    awayBoxScore,
    topPerformers,
    summary: createSummary(homeTeam, awayTeam, scores.homeScore, scores.awayScore, homeTactics, winProbability.matchupLabel),
  };
}

type TacticalModifier = {
  scoreBonus: number;
  strengthBonus: number;
  varianceBonus: number;
  assistBonus: number;
  reboundBonus: number;
  starUsageBonus: number;
  guardUsageBonus: number;
  bigUsageBonus: number;
};

function getTacticalModifier(tactics: TacticalSettings): TacticalModifier {
  const modifier: TacticalModifier = {
    scoreBonus: 0,
    strengthBonus: 0,
    varianceBonus: 0,
    assistBonus: 0,
    reboundBonus: 0,
    starUsageBonus: 0,
    guardUsageBonus: 0,
    bigUsageBonus: 0,
  };

  if (tactics.pace === 'Fast') {
    modifier.scoreBonus += 7;
    modifier.varianceBonus += 4;
  }

  if (tactics.pace === 'Slow') {
    modifier.scoreBonus -= 5;
    modifier.varianceBonus -= 3;
    modifier.strengthBonus += 1;
  }

  if (tactics.offensiveFocus === 'Three-Point Heavy') {
    modifier.scoreBonus += 5;
    modifier.varianceBonus += 5;
    modifier.guardUsageBonus += 8;
  }

  if (tactics.offensiveFocus === 'Inside') {
    modifier.scoreBonus += 2;
    modifier.bigUsageBonus += 10;
    modifier.reboundBonus += 1;
  }

  if (tactics.offensiveFocus === 'Transition') {
    modifier.scoreBonus += 6;
    modifier.guardUsageBonus += 5;
  }

  if (tactics.defensiveStyle === 'Press') {
    modifier.scoreBonus += 3;
    modifier.varianceBonus += 4;
    modifier.strengthBonus -= 1;
  }

  if (tactics.defensiveStyle === 'Zone') {
    modifier.scoreBonus -= 2;
    modifier.strengthBonus += 1;
  }

  if (tactics.reboundingFocus === 'Crash Boards') {
    modifier.reboundBonus += 3;
    modifier.scoreBonus += 1;
  }

  if (tactics.reboundingFocus === 'Get Back') {
    modifier.reboundBonus -= 1;
    modifier.strengthBonus += 1;
  }

  if (tactics.usageFocus === 'Star Player') modifier.starUsageBonus += 16;
  if (tactics.usageFocus === 'Guards') modifier.guardUsageBonus += 12;
  if (tactics.usageFocus === 'Bigs') modifier.bigUsageBonus += 12;

  return modifier;
}

function calculateTeamStrength(team: Team, rotation: RotationPlan | null = null) {
  const activePlayers = rotation
    ? team.roster.filter((player) => (getRotationEntry(rotation, player.id)?.minutes ?? 0) > 0)
    : team.roster;
  const rosterAverage = average(activePlayers.map((player) => player.overall));
  const moraleAverage = average(activePlayers.map((player) => player.morale));
  const formAverage = average(activePlayers.map((player) => player.form));
  const fatigueAverage = average(activePlayers.map((player) => player.fatigue ?? 0));
  const fatiguePenalty = fatigueAverage * 0.08;

  return rosterAverage * 0.68 + moraleAverage * 0.14 + formAverage * 0.14 + team.reputation * 0.08 - fatiguePenalty;
}

type ScorelineInput = {
  awayModifier: TacticalModifier;
  awayStrength: number;
  awayTeam: Team;
  homeModifier: TacticalModifier;
  homeStrength: number;
  homeTeam: Team;
  homeWins: boolean;
  rng: () => number;
};

function createProbabilityAwareScoreline({
  awayModifier,
  awayStrength,
  awayTeam,
  homeModifier,
  homeStrength,
  homeTeam,
  homeWins,
  rng,
}: ScorelineInput) {
  let homeScore = createScore(homeStrength, awayStrength, homeTeam.playStyle, homeModifier, rng);
  let awayScore = createScore(awayStrength, homeStrength, awayTeam.playStyle, awayModifier, rng);

  if (homeWins && homeScore <= awayScore) {
    homeScore = awayScore + randomBetween(1, 9, rng);
  }

  if (!homeWins && awayScore <= homeScore) {
    awayScore = homeScore + randomBetween(1, 9, rng);
  }

  return { homeScore, awayScore };
}

function createScore(ownStrength: number, opponentStrength: number, playStyle: string, modifier: TacticalModifier, rng: () => number) {
  const styleBonus = getPlayStyleScoreModifier(playStyle);
  const strengthGap = (ownStrength - opponentStrength) * 0.9;
  const varianceRange = Math.max(3, 9 + modifier.varianceBonus);
  const variance = randomBetween(-varianceRange, varianceRange + 1, rng);
  const score = 84 + styleBonus + modifier.scoreBonus + strengthGap + variance;

  return Math.max(62, Math.round(score));
}

function getPlayStyleScoreModifier(playStyle: string) {
  const lowered = playStyle.toLowerCase();

  if (lowered.includes('fast') || lowered.includes('transition') || lowered.includes('three')) {
    return 8;
  }

  if (lowered.includes('slow') || lowered.includes('defence') || lowered.includes('defense') || lowered.includes('rim protection')) {
    return -3;
  }

  return 2;
}

function createTeamBoxScore(
  team: Team,
  teamScore: number,
  modifier: TacticalModifier,
  tactics: TacticalSettings,
  rng: () => number,
  rotation: RotationPlan | null,
): PlayerBoxScore[] {
  const normalisedRotation = rotation ? normaliseRotation(team, rotation) : null;
  const usageWeights = team.roster.map((player) => {
    const minutes = normalisedRotation ? getRotationEntry(normalisedRotation, player.id)?.minutes ?? 0 : getDefaultMinutes(player);
    const starBoost = tactics.usageFocus === 'Star Player' && player.overall >= getTeamBestOverall(team) ? modifier.starUsageBonus : 0;
    const guardBoost = ['PG', 'SG'].includes(player.position) ? modifier.guardUsageBonus : 0;
    const bigBoost = ['PF', 'C'].includes(player.position) ? modifier.bigUsageBonus : 0;
    const fatiguePenalty = (player.fatigue ?? 0) * 0.12;

    return Math.max(0, minutes * (player.overall + player.form * 0.25 + starBoost + guardBoost + bigBoost - fatiguePenalty + randomBetween(-8, 8, rng)));
  });
  const totalWeight = usageWeights.reduce((total, weight) => total + weight, 0) || 1;

  return team.roster.map((player, index) => {
    const minutes = normalisedRotation ? getRotationEntry(normalisedRotation, player.id)?.minutes ?? 0 : getDefaultMinutes(player);
    const share = usageWeights[index] / totalWeight;
    const points = minutes <= 0 ? 0 : Math.max(0, Math.round(teamScore * share + randomBetween(-3, 5, rng)));

    return {
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      minutes,
      points,
      rebounds: minutes <= 0 ? 0 : Math.max(0, Math.round((createRebounds(player, rng) + modifier.reboundBonus) * minutes / 28)),
      assists: minutes <= 0 ? 0 : Math.max(0, Math.round((createAssists(player, rng) + modifier.assistBonus) * minutes / 28)),
    };
  }).filter((player) => player.minutes > 0 || player.points > 0);
}

function getDefaultMinutes(player: Player) {
  if (player.role === 'Starter') return 30;
  if (player.role === 'Rotation') return 18;
  if (player.role === 'Depth') return 7;
  return 4;
}

function getTeamBestOverall(team: Team) {
  return Math.max(...team.roster.map((player) => player.overall));
}

function createRebounds(player: Player, rng: () => number) {
  if (player.position === 'C') return randomBetween(7, 14, rng);
  if (player.position === 'PF') return randomBetween(6, 12, rng);
  if (player.position === 'SF') return randomBetween(4, 9, rng);
  return randomBetween(2, 6, rng);
}

function createAssists(player: Player, rng: () => number) {
  if (player.position === 'PG') return randomBetween(5, 12, rng);
  if (player.position === 'SG') return randomBetween(3, 8, rng);
  if (player.position === 'SF') return randomBetween(2, 6, rng);
  return randomBetween(1, 4, rng);
}

function createSummary(homeTeam: Team, awayTeam: Team, homeScore: number, awayScore: number, homeTactics: TacticalSettings, matchupLabel: string) {
  const winner = homeScore > awayScore ? homeTeam : awayTeam;
  const loser = homeScore > awayScore ? awayTeam : homeTeam;
  const margin = Math.abs(homeScore - awayScore);
  const tacticalNote = ` Matchup read: ${matchupLabel}. ${homeTeam.shortName} used ${homeTactics.pace.toLowerCase()} pace with ${homeTactics.offensiveFocus.toLowerCase()} offence.`;

  if (margin <= 3) {
    return `${winner.name} edged out ${loser.name} in a tense late-game finish.${tacticalNote}`;
  }

  if (margin >= 18) {
    return `${winner.name} controlled the game from early on and made a statement win.${tacticalNote}`;
  }

  return `${winner.name} found enough separation after half-time to beat ${loser.name}.${tacticalNote}`;
}

function average(values: number[]) {
  if (values.length === 0) return 0;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function randomBetween(min: number, max: number, rng: () => number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
