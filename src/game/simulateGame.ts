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
  topPerformers: PlayerBoxScore[];
  summary: string;
};

export function simulateGame(homeTeam: Team, awayTeam: Team): SimulatedGameResult {
  const homeStrength = calculateTeamStrength(homeTeam) + 3;
  const awayStrength = calculateTeamStrength(awayTeam);

  const homeScore = createScore(homeStrength, awayStrength, homeTeam.playStyle);
  let awayScore = createScore(awayStrength, homeStrength, awayTeam.playStyle);

  if (homeScore === awayScore) {
    awayScore += Math.random() > 0.5 ? 1 : -1;
  }

  const winnerTeamId = homeScore > awayScore ? homeTeam.id : awayTeam.id;
  const topPerformers = [
    ...createTeamBoxScore(homeTeam, homeScore),
    ...createTeamBoxScore(awayTeam, awayScore),
  ]
    .sort((a, b) => b.points + b.rebounds + b.assists - (a.points + a.rebounds + a.assists))
    .slice(0, 5);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore,
    awayScore,
    winnerTeamId,
    topPerformers,
    summary: createSummary(homeTeam, awayTeam, homeScore, awayScore),
  };
}

function calculateTeamStrength(team: Team) {
  const rosterAverage = average(team.roster.map((player) => player.overall));
  const moraleAverage = average(team.roster.map((player) => player.morale));
  const formAverage = average(team.roster.map((player) => player.form));

  return rosterAverage * 0.7 + moraleAverage * 0.15 + formAverage * 0.15 + team.reputation * 0.08;
}

function createScore(ownStrength: number, opponentStrength: number, playStyle: string) {
  const styleBonus = getPlayStyleScoreModifier(playStyle);
  const strengthGap = (ownStrength - opponentStrength) * 0.9;
  const variance = randomBetween(-9, 10);
  const score = 84 + styleBonus + strengthGap + variance;

  return Math.max(62, Math.round(score));
}

function getPlayStyleScoreModifier(playStyle: string) {
  const lowered = playStyle.toLowerCase();

  if (lowered.includes('fast') || lowered.includes('transition') || lowered.includes('three')) {
    return 8;
  }

  if (lowered.includes('slow') || lowered.includes('defence') || lowered.includes('rim protection')) {
    return -3;
  }

  return 2;
}

function createTeamBoxScore(team: Team, teamScore: number): PlayerBoxScore[] {
  const usageWeights = team.roster.map((player) => player.overall + player.form * 0.25 + randomBetween(-8, 8));
  const totalWeight = usageWeights.reduce((total, weight) => total + weight, 0);

  return team.roster.map((player, index) => {
    const share = usageWeights[index] / totalWeight;
    const points = Math.max(4, Math.round(teamScore * share + randomBetween(-4, 6)));

    return {
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
      teamName: team.name,
      points,
      rebounds: createRebounds(player),
      assists: createAssists(player),
    };
  });
}

function createRebounds(player: Player) {
  if (player.position === 'C') return randomBetween(7, 14);
  if (player.position === 'PF') return randomBetween(6, 12);
  if (player.position === 'SF') return randomBetween(4, 9);
  return randomBetween(2, 6);
}

function createAssists(player: Player) {
  if (player.position === 'PG') return randomBetween(5, 12);
  if (player.position === 'SG') return randomBetween(3, 8);
  if (player.position === 'SF') return randomBetween(2, 6);
  return randomBetween(1, 4);
}

function createSummary(homeTeam: Team, awayTeam: Team, homeScore: number, awayScore: number) {
  const winner = homeScore > awayScore ? homeTeam : awayTeam;
  const loser = homeScore > awayScore ? awayTeam : homeTeam;
  const margin = Math.abs(homeScore - awayScore);

  if (margin <= 3) {
    return `${winner.name} edged out ${loser.name} in a tense late-game finish.`;
  }

  if (margin >= 18) {
    return `${winner.name} controlled the game from early on and made a statement win.`;
  }

  return `${winner.name} found enough separation after half-time to beat ${loser.name}.`;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
