/** Simulate a single game and return team + player box scores. */
export function simulateGame(homeTeam, awayTeam) {
  const homeScore = scoreTeam(homeTeam);
  const awayScore = scoreTeam(awayTeam);

  if (homeScore === awayScore) {
    if (Math.random() > 0.5) {
      return simulateGameWithScores(homeTeam, awayTeam, homeScore + 1, awayScore);
    }
    return simulateGameWithScores(homeTeam, awayTeam, homeScore, awayScore + 1);
  }

  return simulateGameWithScores(homeTeam, awayTeam, homeScore, awayScore);
}

function simulateGameWithScores(homeTeam, awayTeam, homeScore, awayScore) {
  const homeBox = buildTeamBox(homeTeam, homeScore);
  const awayBox = buildTeamBox(awayTeam, awayScore);

  applyResult(homeTeam, awayTeam, homeScore, awayScore);
  applyPlayerTotals(homeTeam, homeBox);
  applyPlayerTotals(awayTeam, awayBox);

  return {
    day: null,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore,
    awayScore,
    winnerTeamId: homeScore > awayScore ? homeTeam.id : awayTeam.id,
    homeBox,
    awayBox,
  };
}

function scoreTeam(team) {
  const base = team.roster.slice(0, 5).reduce((sum, p) => sum + p.overall, 0) / 5;
  return Math.max(70, Math.floor(base + 40 + Math.random() * 30));
}

function buildTeamBox(team, totalPoints) {
  const players = team.roster.slice(0, 8);
  let remainingPoints = totalPoints;
  return players.map((player, index) => {
    const isLast = index === players.length - 1;
    const points = isLast ? remainingPoints : Math.max(2, Math.floor((player.overall / 100) * totalPoints * (0.05 + Math.random() * 0.15)));
    remainingPoints = Math.max(0, remainingPoints - points);
    return {
      playerId: player.id,
      name: player.name,
      points,
      rebounds: Math.floor(1 + Math.random() * 12),
      assists: Math.floor(Math.random() * 10),
      turnovers: Math.floor(Math.random() * 6),
    };
  });
}

function applyResult(homeTeam, awayTeam, homeScore, awayScore) {
  if (homeScore > awayScore) {
    homeTeam.wins += 1;
    awayTeam.losses += 1;
  } else {
    awayTeam.wins += 1;
    homeTeam.losses += 1;
  }
}

function applyPlayerTotals(team, box) {
  for (const line of box) {
    const player = team.roster.find((p) => p.id === line.playerId);
    if (!player) continue;
    player.season.games += 1;
    player.season.points += line.points;
    player.season.rebounds += line.rebounds;
    player.season.assists += line.assists;
    player.season.turnovers += line.turnovers;
  }
}
