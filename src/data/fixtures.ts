import { teams } from './teams';
import type { Fixture } from '../types/basketball';

export const seasonFixtures = createSeasonFixtures(teams.map((team) => team.id));

export function getFixturesForRound(round: number) {
  return seasonFixtures.filter((fixture) => fixture.round === round);
}

function createSeasonFixtures(teamIds: string[]): Fixture[] {
  const firstHalf = createSingleRoundRobin(teamIds, 1, false);
  const secondHalf = createSingleRoundRobin(teamIds, teamIds.length, true);

  return [...firstHalf, ...secondHalf];
}

function createSingleRoundRobin(teamIds: string[], startingRound: number, reverseHomeAway: boolean): Fixture[] {
  const rounds = teamIds.length - 1;
  const gamesPerRound = teamIds.length / 2;
  let rotation = [...teamIds];
  const fixtures: Fixture[] = [];

  for (let roundIndex = 0; roundIndex < rounds; roundIndex += 1) {
    const round = startingRound + roundIndex;

    for (let gameIndex = 0; gameIndex < gamesPerRound; gameIndex += 1) {
      const leftTeam = rotation[gameIndex];
      const rightTeam = rotation[rotation.length - 1 - gameIndex];
      const swapForBalance = roundIndex % 2 === 1;
      const homeTeamId = reverseHomeAway !== swapForBalance ? rightTeam : leftTeam;
      const awayTeamId = reverseHomeAway !== swapForBalance ? leftTeam : rightTeam;

      fixtures.push({
        id: `round-${round}-game-${gameIndex + 1}`,
        round,
        homeTeamId,
        awayTeamId,
      });
    }

    rotation = rotateTeams(rotation);
  }

  return fixtures;
}

function rotateTeams(teamIds: string[]) {
  const fixedTeam = teamIds[0];
  const lastTeam = teamIds[teamIds.length - 1];
  const middleTeams = teamIds.slice(1, teamIds.length - 1);

  return [fixedTeam, lastTeam, ...middleTeams];
}
