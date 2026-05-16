import { createRoster } from './player.js';

/** Create one team with roster and empty record. */
export function createTeam(id, name) {
  return {
    id,
    name,
    wins: 0,
    losses: 0,
    roster: createRoster(id),
  };
}

/** Re-sort roster so starters appear first. */
export function normalizeLineup(team) {
  const starters = team.roster.filter((p) => p.lineupSlot === 'Starter');
  const bench = team.roster.filter((p) => p.lineupSlot !== 'Starter');
  team.roster = [...starters, ...bench];
  return team;
}
