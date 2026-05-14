import type { SimulatedGameResult } from './simulateGame';

export type SimulationDiagnostics = {
  games: number;
  averageCombinedScore: number;
  homeWinRate: number;
  upsetRate: number;
  blowoutRate: number;
};

export function calculateSimulationDiagnostics(
  results: SimulatedGameResult[],
  userTeamId?: string,
): SimulationDiagnostics {
  if (results.length === 0) {
    return {
      games: 0,
      averageCombinedScore: 0,
      homeWinRate: 0,
      upsetRate: 0,
      blowoutRate: 0,
    };
  }

  const games = results.length;
  const combinedScoreTotal = results.reduce((total, result) => total + result.homeScore + result.awayScore, 0);
  const homeWins = results.filter((result) => result.winnerTeamId === result.homeTeamId).length;
  const blowouts = results.filter((result) => Math.abs(result.homeScore - result.awayScore) >= 15).length;
  const userGames = userTeamId
    ? results.filter((result) => result.homeTeamId === userTeamId || result.awayTeamId === userTeamId)
    : [];
  const userUpsets = userGames.filter((result) => {
    if (result.matchupLabel === 'Strong advantage' && result.winnerTeamId !== userTeamId) return true;
    if (result.matchupLabel === 'Major underdog' && result.winnerTeamId === userTeamId) return true;
    return false;
  }).length;

  return {
    games,
    averageCombinedScore: round(combinedScoreTotal / games),
    homeWinRate: round(homeWins / games),
    upsetRate: round(userGames.length ? userUpsets / userGames.length : 0),
    blowoutRate: round(blowouts / games),
  };
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}
