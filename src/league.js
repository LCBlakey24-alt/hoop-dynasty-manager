import { createTeam } from './team.js';

/** Create a 20-team league with simple generated names. */
export function createLeague(leagueName = 'Hardwood Dynasty League') {
  const teams = Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    return createTeam(`team-${n}`, `Team ${n}`);
  });

  return {
    version: '0.1',
    title: 'Hardwood Dynasty',
    leagueName,
    day: 1,
    gameLog: [],
    teams,
  };
}

/** Return standings sorted by win percentage then wins. */
export function getStandings(league) {
  return [...league.teams]
    .map((team) => ({ ...team, pct: team.wins + team.losses === 0 ? 0 : team.wins / (team.wins + team.losses) }))
    .sort((a, b) => b.pct - a.pct || b.wins - a.wins);
}
