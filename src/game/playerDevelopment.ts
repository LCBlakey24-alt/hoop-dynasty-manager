import type { Player, PlayerDevelopmentChange, RotationPlan, Team } from '../types/basketball';
import { getRotationEntry, normaliseRotation } from './rotation';

export function applyPostGameDevelopment(team: Team, rotation: RotationPlan): { team: Team; changes: PlayerDevelopmentChange[] } {
  const normalisedRotation = normaliseRotation(team, rotation);
  const changes: PlayerDevelopmentChange[] = [];

  const roster = team.roster.map((player) => {
    const minutes = getRotationEntry(normalisedRotation, player.id)?.minutes ?? 0;
    const progressGain = calculateProgressGain(player, minutes);
    const currentProgress = player.developmentProgress ?? 0;
    const rawNextProgress = currentProgress + progressGain;
    const canImprove = player.overall < player.potential;
    const overallGain = canImprove ? Math.floor(rawNextProgress / 100) : 0;
    const overallAfter = Math.min(player.potential, player.overall + overallGain);
    const nextProgress = canImprove ? rawNextProgress % 100 : 100;

    changes.push({
      playerId: player.id,
      playerName: player.name,
      minutes,
      progressGain,
      nextProgress,
      overallBefore: player.overall,
      overallAfter,
      potential: player.potential,
      note: createDevelopmentNote(player, minutes, progressGain, overallAfter),
    });

    return {
      ...player,
      overall: overallAfter,
      developmentProgress: nextProgress,
    };
  });

  return {
    team: { ...team, roster },
    changes,
  };
}

function calculateProgressGain(player: Player, minutes: number) {
  if (player.overall >= player.potential) return 0;

  const ageMultiplier = player.age <= 20
    ? 1.45
    : player.age <= 23
      ? 1.25
      : player.age <= 26
        ? 0.9
        : player.age <= 30
          ? 0.45
          : 0.15;
  const potentialGap = Math.max(0, player.potential - player.overall);
  const potentialMultiplier = 1 + Math.min(0.55, potentialGap / 35);
  const minutesMultiplier = minutes >= 28
    ? 1.25
    : minutes >= 18
      ? 1
      : minutes >= 8
        ? 0.65
        : minutes > 0
          ? 0.35
          : 0.08;
  const roleMultiplier = player.role === 'Prospect'
    ? 1.2
    : player.role === 'Rotation'
      ? 1
      : player.role === 'Starter'
        ? 0.95
        : 0.75;
  const formMultiplier = player.form >= 78
    ? 1.18
    : player.form <= 60
      ? 0.75
      : 1;
  const moraleMultiplier = player.morale >= 78
    ? 1.15
    : player.morale <= 60
      ? 0.75
      : 1;
  const fatigueMultiplier = (player.fatigue ?? 0) >= 80
    ? 0.45
    : (player.fatigue ?? 0) >= 65
      ? 0.7
      : 1;
  const injuryMultiplier = player.injury
    ? 0.35
    : 1;

  return Math.max(0, Math.round(8 * ageMultiplier * potentialMultiplier * minutesMultiplier * roleMultiplier * formMultiplier * moraleMultiplier * fatigueMultiplier * injuryMultiplier));
}

function createDevelopmentNote(player: Player, minutes: number, progressGain: number, overallAfter: number) {
  if (overallAfter > player.overall) return `${player.name} improved to ${overallAfter} OVR after strong development progress.`;
  if (player.overall >= player.potential) return `${player.name} is currently at their projected ceiling.`;
  if (player.injury) return `${player.name}'s development was slowed by injury management.`;
  if ((player.fatigue ?? 0) >= 75) return `${player.name}'s high fatigue slowed development.`;
  if (minutes >= 18 && progressGain > 0) return `${player.name} gained useful development from meaningful minutes.`;
  if (minutes <= 4) return `${player.name} gained little development due to limited minutes.`;

  return `${player.name} made steady development progress.`;
}
