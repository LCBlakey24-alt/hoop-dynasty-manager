import type { SimulatedGameResult } from './simulateGame';
import type { Standing, Team } from '../types/basketball';

export function calculateBoardConfidence({
  standings,
  selectedTeamId,
  latestUserGame,
  results,
  selectedTeam,
}: {
  standings: Standing[];
  selectedTeamId: string;
  latestUserGame: SimulatedGameResult | null;
  results: SimulatedGameResult[];
  selectedTeam: Team;
}) {
  const teamIndex = standings.findIndex((standing) => standing.teamId === selectedTeamId);

  if (teamIndex === -1) return 70;

  const standing = standings[teamIndex];
  const rank = teamIndex + 1;
  const totalTeams = standings.length;
  const expectationRank = getExpectedRank(selectedTeam, totalTeams);
  const expectationGap = expectationRank - rank;
  const expectationScore = Math.max(-10, Math.min(10, expectationGap * 2));
  const recentUserGames = results
    .filter((result) => result.homeTeamId === selectedTeamId || result.awayTeamId === selectedTeamId)
    .slice(-5);
  const recentWins = recentUserGames.filter((result) => result.winnerTeamId === selectedTeamId).length;
  const formScore = recentUserGames.length > 0 ? Math.round(((recentWins / recentUserGames.length) - 0.5) * 12) : 0;
  const rankScore = Math.round(((totalTeams - rank) / Math.max(1, totalTeams - 1)) * 20);
  const recordScore = Math.round((standing.winPercentage - 0.5) * 35);
  const pdScore = Math.max(-8, Math.min(8, Math.round(standing.pointDifference / Math.max(1, standing.played * 2.5))));
  const latestGameScore = latestUserGame ? (latestUserGame.winnerTeamId === selectedTeamId ? 4 : -5) : 0;

  return Math.max(35, Math.min(97, 64 + rankScore + expectationScore + recordScore + pdScore + latestGameScore + formScore));
}

function getExpectedRank(team: Team, totalTeams: number) {
  const reputationWeight = team.reputation * 0.5;
  const rosterOverall = team.roster.reduce((sum, player) => sum + player.overall, 0) / Math.max(1, team.roster.length);
  const contenderScore = reputationWeight + rosterOverall;

  if (contenderScore >= 112) return Math.ceil(totalTeams * 0.25);
  if (contenderScore >= 103) return Math.ceil(totalTeams * 0.45);
  if (contenderScore >= 96) return Math.ceil(totalTeams * 0.65);
  return Math.ceil(totalTeams * 0.85);
}
