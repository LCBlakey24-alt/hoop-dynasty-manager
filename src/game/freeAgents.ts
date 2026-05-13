import { getPlayerContract, getTeamAnnualWages } from './contracts';
import type { Player, Team } from '../types/basketball';

const MAX_RECOMMENDED_ROSTER_SIZE = 14;

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
  if (!canSignFreeAgent(player, team).approved) return team;
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

export function canSignFreeAgent(player: Player, team: Team) {
  const contract = createFreeAgentContract(player, team);
  const currentWages = getTeamAnnualWages(team);
  const wageBudget = getSuggestedWageBudget(team);
  const projectedWages = currentWages + contract.annualWage;
  const overBudgetPercent = Math.round((projectedWages / wageBudget) * 100);

  if (team.roster.some((candidate) => candidate.id === player.id)) {
    return { approved: false, reason: 'Already signed', projectedWages, wageBudget };
  }

  if (team.roster.length >= MAX_RECOMMENDED_ROSTER_SIZE) {
    return { approved: false, reason: 'Roster full', projectedWages, wageBudget };
  }

  if (projectedWages > wageBudget * 1.08) {
    return { approved: false, reason: `Board blocks wage spend at ${overBudgetPercent}% of budget`, projectedWages, wageBudget };
  }

  if (getFreeAgentInterest(player, team) === 'Unlikely') {
    return { approved: false, reason: 'Player not interested', projectedWages, wageBudget };
  }

  return { approved: true, reason: projectedWages > wageBudget ? 'Board approval: tight but allowed' : 'Board approval granted', projectedWages, wageBudget };
}

export function getSuggestedWageBudget(team: Team) {
  return Math.round(240000 + team.reputation * 3900);
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
