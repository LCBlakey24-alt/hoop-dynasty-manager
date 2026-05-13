import type { Player, PlayerContract, Team } from '../types/basketball';

export function getPlayerContract(player: Player, team: Team): PlayerContract {
  if (player.contract) return player.contract;

  const yearsRemaining = getDefaultYearsRemaining(player);

  return {
    annualWage: calculateDefaultAnnualWage(player, team),
    yearsRemaining,
    status: getContractStatus(yearsRemaining, player),
  };
}

export function getTeamAnnualWages(team: Team) {
  return team.roster.reduce((total, player) => total + getPlayerContract(player, team).annualWage, 0);
}

export function getExpiringPlayers(team: Team) {
  return team.roster.filter((player) => getPlayerContract(player, team).yearsRemaining <= 1);
}

export function getContractRiskLabel(player: Player, team: Team) {
  const contract = getPlayerContract(player, team);

  if (contract.yearsRemaining <= 1 && player.overall >= 76) return 'High risk';
  if (contract.yearsRemaining <= 1) return 'Expiring';
  if (contract.annualWage > player.overall * 1900) return 'Expensive';
  if (player.potential - player.overall >= 12 && contract.annualWage < player.potential * 900) return 'Bargain';
  return 'Stable';
}

export function formatMoney(value: number) {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);

  if (absolute >= 1000000) return `${sign}£${(absolute / 1000000).toFixed(1)}m`;
  return `${sign}£${Math.round(absolute / 1000)}k`;
}

function calculateDefaultAnnualWage(player: Player, team: Team) {
  const roleMultiplier = player.role === 'Starter'
    ? 1.8
    : player.role === 'Rotation'
      ? 1.08
      : player.role === 'Depth'
        ? 0.58
        : 0.34;
  const reputationMultiplier = 0.75 + team.reputation / 130;
  const potentialPremium = Math.max(0, player.potential - player.overall) * 950;
  const agePremium = player.age >= 27 && player.age <= 31 ? 8500 : 0;
  const base = player.overall * 1250 * roleMultiplier * reputationMultiplier;

  return Math.round((base + potentialPremium + agePremium) / 1000) * 1000;
}

function getDefaultYearsRemaining(player: Player) {
  if (player.role === 'Prospect') return 3;
  if (player.age >= 32) return 1;
  if (player.role === 'Starter') return 2;
  if (player.role === 'Rotation') return 2;
  return 1;
}

function getContractStatus(yearsRemaining: number, player: Player): PlayerContract['status'] {
  if (player.role === 'Prospect') return 'Youth Deal';
  if (yearsRemaining <= 1 && player.overall >= 74) return 'Renewal Needed';
  if (yearsRemaining <= 1) return 'Expiring';
  return 'Secure';
}
