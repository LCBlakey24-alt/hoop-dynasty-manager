import type { Standing, Team } from '../types/basketball';
import type { SimulatedGameResult } from './simulateGame';

export function calculateStandings(teams: Team[], results: SimulatedGameResult[]): Standing[] {
  const standings = teams.map<Standing>((team) => {
    const teamResults = results.filter(
      (result) => result.homeTeamId === team.id || result.awayTeamId === team.id,
    );

    const wins = teamResults.filter((result) => result.winnerTeamId === team.id).length;
    const losses = teamResults.length - wins;
    const pointsFor = teamResults.reduce((total, result) => total + getPointsFor(team.id, result), 0);
    const pointsAgainst = teamResults.reduce((total, result) => total + getPointsAgainst(team.id, result), 0);
    const played = teamResults.length;

    return {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName,
      nation: team.nation,
      primaryColor: team.primaryColor,
      played,
      wins,
      losses,
      pointsFor,
      pointsAgainst,
      pointDifference: pointsFor - pointsAgainst,
      winPercentage: played === 0 ? 0 : wins / played,
    };
  });

  return standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.pointDifference !== a.pointDifference) return b.pointDifference - a.pointDifference;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return a.teamName.localeCompare(b.teamName);
  });
}

function getPointsFor(teamId: string, result: SimulatedGameResult) {
  return result.homeTeamId === teamId ? result.homeScore : result.awayScore;
}

function getPointsAgainst(teamId: string, result: SimulatedGameResult) {
  return result.homeTeamId === teamId ? result.awayScore : result.homeScore;
}
