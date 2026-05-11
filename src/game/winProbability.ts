import { defaultTactics, type TacticalSettings } from './tactics';
import type { Team } from '../types/basketball';

export type WinProbabilityBreakdown = {
  homeWinProbability: number;
  awayWinProbability: number;
  matchupLabel: string;
};

type WinProbabilityOptions = {
  homeTactics?: TacticalSettings;
  awayTactics?: TacticalSettings;
};

const MIN_WIN_CHANCE = 0.05;
const MAX_WIN_CHANCE = 0.95;

export function calculateWinProbability(
  homeTeam: Team,
  awayTeam: Team,
  options: WinProbabilityOptions = {},
): WinProbabilityBreakdown {
  const homeTactics = options.homeTactics ?? defaultTactics;
  const awayTactics = options.awayTactics ?? defaultTactics;
  const homeStrength = calculateBaseStrength(homeTeam) + 3 + calculateTacticalFit(homeTeam, homeTactics, awayTactics);
  const awayStrength = calculateBaseStrength(awayTeam) + calculateTacticalFit(awayTeam, awayTactics, homeTactics);
  const strengthDifference = homeStrength - awayStrength;
  const rawHomeProbability = 1 / (1 + Math.exp(-strengthDifference / 10));
  const homeWinProbability = clamp(rawHomeProbability, MIN_WIN_CHANCE, MAX_WIN_CHANCE);
  const awayWinProbability = 1 - homeWinProbability;

  return {
    homeWinProbability,
    awayWinProbability,
    matchupLabel: getMatchupLabel(homeWinProbability),
  };
}

function calculateBaseStrength(team: Team) {
  const rosterAverage = average(team.roster.map((player) => player.overall));
  const moraleAverage = average(team.roster.map((player) => player.morale));
  const formAverage = average(team.roster.map((player) => player.form));
  const starterAverage = average(team.roster.filter((player) => player.role === 'Starter').map((player) => player.overall));
  const rotationAverage = average(team.roster.filter((player) => player.role === 'Rotation').map((player) => player.overall));

  return rosterAverage * 0.42
    + starterAverage * 0.24
    + rotationAverage * 0.12
    + moraleAverage * 0.1
    + formAverage * 0.08
    + team.reputation * 0.04;
}

function calculateTacticalFit(team: Team, ownTactics: TacticalSettings, opponentTactics: TacticalSettings) {
  let modifier = 0;
  const archetypes = team.roster.map((player) => player.archetype);

  if (ownTactics.pace === 'Fast') {
    modifier += countFits(archetypes, ['Slasher', 'Two-Way Wing', 'Floor General']) * 0.35;
    if (opponentTactics.reboundingFocus === 'Get Back' || opponentTactics.pace === 'Slow') modifier -= 1.5;
  }

  if (ownTactics.pace === 'Slow') {
    modifier += countFits(archetypes, ['Veteran Leader', 'Floor General', 'Rim Protector', 'Playmaking Big']) * 0.3;
    if (opponentTactics.defensiveStyle === 'Press') modifier -= 1;
  }

  if (ownTactics.offensiveFocus === 'Three-Point Heavy') {
    modifier += countFits(archetypes, ['Sharpshooter', 'Stretch Big', 'Floor General', 'Playmaking Big']) * 0.35;
    if (opponentTactics.defensiveStyle === 'Zone') modifier += 1.5;
  }

  if (ownTactics.offensiveFocus === 'Inside') {
    modifier += countFits(archetypes, ['Rim Protector', 'Glass Cleaner', 'Playmaking Big', 'Slasher']) * 0.35;
    if (opponentTactics.defensiveStyle === 'Zone') modifier -= 1.5;
  }

  if (ownTactics.defensiveStyle === 'Press') {
    modifier += countFits(archetypes, ['Lockdown Defender', 'Two-Way Wing', 'Slasher']) * 0.3;
    if (opponentTactics.pace === 'Slow') modifier -= 1;
  }

  if (ownTactics.defensiveStyle === 'Zone') {
    modifier += countFits(archetypes, ['Rim Protector', 'Glass Cleaner', 'Veteran Leader']) * 0.3;
    if (opponentTactics.offensiveFocus === 'Three-Point Heavy') modifier -= 1.5;
  }

  if (ownTactics.reboundingFocus === 'Crash Boards') {
    modifier += countFits(archetypes, ['Glass Cleaner', 'Rim Protector']) * 0.35;
    if (opponentTactics.pace === 'Fast' || opponentTactics.offensiveFocus === 'Transition') modifier -= 1.5;
  }

  if (ownTactics.usageFocus === 'Star Player') {
    const star = Math.max(...team.roster.map((player) => player.overall));
    if (star >= 80) modifier += 1.5;
    if (opponentTactics.defensiveStyle === 'Zone') modifier -= 0.75;
  }

  if (ownTactics.usageFocus === 'Guards') {
    modifier += countPositions(team, ['PG', 'SG'], 74) * 0.4;
    if (opponentTactics.defensiveStyle === 'Press') modifier -= 0.75;
  }

  if (ownTactics.usageFocus === 'Bigs') {
    modifier += countPositions(team, ['PF', 'C'], 74) * 0.4;
    if (opponentTactics.defensiveStyle === 'Zone') modifier -= 0.75;
  }

  return modifier;
}

function countFits(archetypes: string[], fits: string[]) {
  return archetypes.filter((archetype) => fits.includes(archetype)).length;
}

function countPositions(team: Team, positions: string[], minimumOverall: number) {
  return team.roster.filter((player) => positions.includes(player.position) && player.overall >= minimumOverall).length;
}

function getMatchupLabel(homeWinProbability: number) {
  if (homeWinProbability >= 0.72) return 'Strong advantage';
  if (homeWinProbability >= 0.58) return 'Slight advantage';
  if (homeWinProbability >= 0.42) return 'Even matchup';
  if (homeWinProbability >= 0.28) return 'Risky matchup';
  return 'Major underdog';
}

function average(values: number[]) {
  if (values.length === 0) return 0;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
