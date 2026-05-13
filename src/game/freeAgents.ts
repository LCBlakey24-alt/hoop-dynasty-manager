import { getPlayerContract } from './contracts';
import type { Player, Team } from '../types/basketball';

export function createFreeAgentContract(player: Player, team: Team) {
  const marketContract = getPlayerContract(player, team);
  const yearsRemaining = player.age >= 32 ? 1 : player.role === 'Prospect' ? 2 : 1;
  const marketPremium = player.overall >= 72 ? 1.08 : player.potential - player.overall >= 10 ? 1.06 : 1;

  return {
    ...marketContract,
    annualWage: Math.round((marketContract.annualWage * marketPremium) / 1000) * 1000,
    yearsRemaining,
    status: player.role === 'Prospect' ? 'Youth Deal' as const : 'Secure' as const,
  };
}

export function signFreeAgent(team: Team, player: Player): Team {
  if (team.roster.some((candidate) => candidate.id === player.id)) return team;

  const signedPlayer: Player = {
    ...player,
    contract: createFreeAgentContract(player, team),
    morale: Math.min(99, player.morale + 4),
    form: Math.max(50, player.form),
  };

  return {
    ...team,
    roster: [...team.roster, signedPlayer],
  };
}

export function getFreeAgentFitLabel(player: Player, team: Team) {
  const positionCount = team.roster.filter((candidate) => candidate.position === player.position).length;
  const potentialGap = player.potential - player.overall;

  if (positionCount <= 1) return 'Fills need';
  if (player.overall >= 72) return 'Ready rotation';
  if (potentialGap >= 10) return 'Upside punt';
  if (player.age >= 32) return 'Veteran cover';
  return 'Depth option';
}

export function getFreeAgentInterest(player: Player, team: Team) {
  const reputationPull = team.reputation - 60;
  const roleFit = player.role === 'Prospect' ? 8 : player.role === 'Rotation' ? 4 : 0;
  const crowdedPenalty = Math.max(0, team.roster.filter((candidate) => candidate.position === player.position).length - 2) * 4;
  const score = Math.max(35, Math.min(95, 58 + reputationPull + roleFit - crowdedPenalty));

  if (score >= 78) return 'Very Interested';
  if (score >= 62) return 'Interested';
  if (score >= 48) return 'Open';
  return 'Unlikely';
}
