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
    createMatchup('qf-1', seeds[0], seeds[7]),
    createMatchup('qf-2', seeds[3], seeds[4]),
    createMatchup('qf-3', seeds[1], seeds[6]),
    createMatchup('qf-4', seeds[2], seeds[5]),
  ];
}

function createMatchup(id: string, homeSeed: PlayoffSeed, awaySeed: PlayoffSeed): PlayoffMatchup {
  return {
    id,
    round: 'Quarter-Final',
    homeSeed,
    awaySeed,
  };
}
