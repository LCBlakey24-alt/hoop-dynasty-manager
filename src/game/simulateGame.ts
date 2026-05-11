import { defaultTactics, type TacticalSettings } from './tactics';
import { calculateWinProbability } from './winProbability';
import type { Player, Team } from '../types/basketball';

export type PlayerBoxScore = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
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
  rng?: () => number;
};

export function simulateGame(homeTeam: Team, awayTeam: Team, options: SimulateGameOptions = {}): SimulatedGameResult {
  const homeTactics = options.homeTactics ?? defaultTactics;
  const rng = options.rng ?? Math.random;
  const awayTactics = options.awayTactics ?? defaultTactics;
  const homeModifier = getTacticalModifier(homeTactics);
  const awayModifier = getTacticalModifier(awayTactics);
  const winProbability = calculateWinProbability(homeTeam, awayTeam, { homeTactics, awayTactics });
  const homeWins = rng() <= winProbability.homeWinProbability;
  const winnerTeamId = homeWins ? homeTeam.id : awayTeam.id;
  const homeStrength = calculateTeamStrength(homeTeam) + 3 + homeModifier.strengthBonus;
  const awayStrength = calculateTeamStrength(awayTeam) + awayModifier.strengthBonus;
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

  const homeBoxScore = createTeamBoxScore(homeTeam, scores.homeScore, homeModifier, homeTactics, rng);
  const awayBoxScore = createTeamBoxScore(awayTeam, scores.awayScore, awayModifier, awayTactics, rng);
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

function calculateTeamStrength(team: Team) {
  const rosterAverage = average(team.roster.map((player) => player.overall));
  const moraleAverage = average(team.roster.map((player) => player.morale));
  const formAverage = average(team.roster.map((player) => player.form));

  return rosterAverage * 0.7 + moraleAverage * 0.15 + formAverage * 0.15 + team.reputation * 0.08;
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

function createTeamBoxScore(team: Team, teamScore: number, modifier: TacticalModifier, tactics: TacticalSettings, rng: () => number): PlayerBoxScore[] {
  const usageWeights = team.roster.map((player) => {
    const starBoost = tactics.usageFocus === 'Star Player' && player.overall >= getTeamBestOverall(team) ? modifier.starUsageBonus : 0;
    const guardBoost = ['PG', 'SG'].includes(player.position) ? modifier.guardUsageBonus : 0;
    const bigBoost = ['PF', 'C'].includes(player.position) ? modifier.bigUsageBonus : 0;

    return player.overall + player.form * 0.25 + starBoost + guardBoost + bigBoost + randomBetween(-8, 8, rng);
  });
  const totalWeight = usageWeights.reduce((total, weight) => total + weight, 0);

  return team.roster.map((player, index) => {
    const share = usageWeights[index] / totalWeight;
    const points = Math.max(2, Math.round(teamScore * share + randomBetween(-4, 6, rng)));

    return {
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      points,
      rebounds: Math.max(0, createRebounds(player, rng) + modifier.reboundBonus),
      assists: Math.max(0, createAssists(player, rng) + modifier.assistBonus),
    };
  });
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
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function randomBetween(min: number, max: number, rng: () => number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
