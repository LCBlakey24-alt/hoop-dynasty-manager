import type { SimulatedGameResult } from './simulateGame';
import type { Standing } from '../types/basketball';

export type PlayoffSeed = {
  seed: number;
  standing: Standing;
};

export type PlayoffMatchup = {
  id: string;
  round: 'Quarter-Final' | 'Semi-Final' | 'Final';
  homeSeed: PlayoffSeed;
  awaySeed: PlayoffSeed;
};

export function getPlayoffSeeds(standings: Standing[]): PlayoffSeed[] {
  return standings.slice(0, 8).map((standing, index) => ({
    seed: index + 1,
    standing,
  }));
}

export function createQuarterFinalMatchups(standings: Standing[]): PlayoffMatchup[] {
  const seeds = getPlayoffSeeds(standings);

  if (seeds.length < 8) return [];

  return [
    createMatchup('qf-1', 'Quarter-Final', seeds[0], seeds[7]),
    createMatchup('qf-2', 'Quarter-Final', seeds[3], seeds[4]),
    createMatchup('qf-3', 'Quarter-Final', seeds[1], seeds[6]),
    createMatchup('qf-4', 'Quarter-Final', seeds[2], seeds[5]),
  ];
}

export function createSemiFinalMatchups(standings: Standing[], playoffResults: SimulatedGameResult[]): PlayoffMatchup[] {
  const quarterFinals = createQuarterFinalMatchups(standings);
  const qfWinners = quarterFinals.map((matchup) => findWinnerSeed(matchup, playoffResults));

  if (qfWinners.some((winner) => !winner)) return [];

  return [
    createMatchup('sf-1', 'Semi-Final', qfWinners[0]!, qfWinners[1]!),
    createMatchup('sf-2', 'Semi-Final', qfWinners[2]!, qfWinners[3]!),
  ];
}

export function createFinalMatchup(standings: Standing[], playoffResults: SimulatedGameResult[]): PlayoffMatchup | null {
  const semiFinals = createSemiFinalMatchups(standings, playoffResults);
  const sfWinners = semiFinals.map((matchup) => findWinnerSeed(matchup, playoffResults));

  if (sfWinners.length < 2 || sfWinners.some((winner) => !winner)) return null;

  return createMatchup('final', 'Final', sfWinners[0]!, sfWinners[1]!);
}

export function getChampion(standings: Standing[], playoffResults: SimulatedGameResult[]): PlayoffSeed | null {
  const final = createFinalMatchup(standings, playoffResults);

  if (!final) return null;

  return findWinnerSeed(final, playoffResults);
}

function findWinnerSeed(matchup: PlayoffMatchup, playoffResults: SimulatedGameResult[]) {
  const result = playoffResults.find(
    (candidate) => candidate.homeTeamId === matchup.homeSeed.standing.teamId
      && candidate.awayTeamId === matchup.awaySeed.standing.teamId,
  );

  if (!result) return null;

  return result.winnerTeamId === matchup.homeSeed.standing.teamId ? matchup.homeSeed : matchup.awaySeed;
}

function createMatchup(id: string, round: PlayoffMatchup['round'], homeSeed: PlayoffSeed, awaySeed: PlayoffSeed): PlayoffMatchup {
  return {
    id,
    round,
    homeSeed,
    awaySeed,
  };
}
