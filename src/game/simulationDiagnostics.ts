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
    const userIsHome = result.homeTeamId === userTeamId;
    const homeExpectedWin = getHomeExpectedWin(result.matchupLabel);
    if (homeExpectedWin === null) return false;

    const userExpectedWin = userIsHome ? homeExpectedWin : !homeExpectedWin;
    const userWon = result.winnerTeamId === userTeamId;
    return userExpectedWin !== userWon;
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

function getHomeExpectedWin(matchupLabel: SimulatedGameResult['matchupLabel']) {
  if (matchupLabel === 'Strong advantage' || matchupLabel === 'Slight advantage') return true;
  if (matchupLabel === 'Risky matchup' || matchupLabel === 'Major underdog') return false;
  return null;
}
