import type { Player, PlayerConditionChange, PlayerInjury, RotationPlan, Team } from '../types/basketball';
import type { TrainingFocus } from '../components/TrainingScreen';
import { getRotationEntry, normaliseRotation } from './rotation';

export function applyPostGameCondition(
  team: Team,
  rotation: RotationPlan,
  trainingFocus: TrainingFocus,
): { team: Team; changes: PlayerConditionChange[] } {
  const normalisedRotation = normaliseRotation(team, rotation);
  const changes: PlayerConditionChange[] = [];

  const updatedRoster = team.roster.map((player) => {
    const entry = getRotationEntry(normalisedRotation, player.id);
    const minutes = entry?.minutes ?? getRoleExpectedMinutes(player);
    const previousFatigue = player.fatigue ?? 0;
    const updatedExistingInjury = progressInjury(player.injury ?? null, minutes);
    const fatigueChange = getFatigueChange(minutes, trainingFocus, updatedExistingInjury);
    const formChange = getFormChange(minutes, previousFatigue, trainingFocus, updatedExistingInjury);
    const moraleChange = getMoraleChange(player, minutes, updatedExistingInjury);
    const nextFatigue = clamp(previousFatigue + fatigueChange, 0, 99);
    const createdInjury = updatedExistingInjury ? null : maybeCreateInjury(player, minutes, nextFatigue, trainingFocus);
    const nextInjury = createdInjury ?? updatedExistingInjury;
    const nextForm = clamp(player.form + formChange + (createdInjury ? -2 : 0), 40, 99);
    const nextMorale = clamp(player.morale + moraleChange + (createdInjury ? -1 : 0), 40, 99);

    changes.push({
      playerId: player.id,
      playerName: player.name,
      minutes,
      fatigueChange,
      formChange: nextForm - player.form,
      moraleChange: nextMorale - player.morale,
      nextFatigue,
      nextForm,
      nextMorale,
      injury: nextInjury,
      note: createConditionNote(minutes, fatigueChange, nextForm - player.form, nextMorale - player.morale, nextInjury, createdInjury),
    });

    return {
      ...player,
      fatigue: nextFatigue,
      form: nextForm,
      morale: nextMorale,
      injury: nextInjury,
    };
  });

  return {
    team: { ...team, roster: updatedRoster },
    changes,
  };
}

export function mergeManagedTeam(teams: Team[], managedTeam: Team): Team[] {
  return teams.map((team) => (team.id === managedTeam.id ? managedTeam : team));
}

export function getFitnessLabel(player: Player) {
  if (player.injury) return `${player.injury.severity}: ${player.injury.type} (${player.injury.gamesRemaining})`;
  const fatigue = player.fatigue ?? 0;

  if (fatigue >= 80) return 'Exhausted';
  if (fatigue >= 65) return 'Tired';
  if (fatigue >= 45) return 'Managed';
  if (fatigue <= 15) return 'Fresh';
  return 'Fit';
}

function getFatigueChange(minutes: number, trainingFocus: TrainingFocus, injury: PlayerInjury | null) {
  const conditioningReduction = trainingFocus === 'Conditioning' ? 2 : 0;
  const injuryPenalty = injury ? 2 : 0;

  if (minutes >= 38) return 8 - conditioningReduction + injuryPenalty;
  if (minutes >= 32) return 5 - conditioningReduction + injuryPenalty;
  if (minutes >= 24) return 3 - conditioningReduction + injuryPenalty;
  if (minutes >= 12) return 1 - conditioningReduction;

  return injury ? -1 : -3;
}

function getFormChange(minutes: number, currentFatigue: number, trainingFocus: TrainingFocus, injury: PlayerInjury | null) {
  let change = 0;

  if (minutes >= 18 && minutes <= 34) change += 1;
  if (minutes >= 38 || currentFatigue >= 75) change -= 2;
  if (trainingFocus === 'Offense' || trainingFocus === 'Defense') change += 1;
  if (trainingFocus === 'Conditioning' && currentFatigue >= 50) change += 1;
  if (injury) change -= 1;

  return change;
}

function getMoraleChange(player: Player, minutes: number, injury: PlayerInjury | null) {
  const expectedMinutes = getRoleExpectedMinutes(player);

  if (injury && minutes >= 24) return -1;
  if (minutes >= expectedMinutes + 6) return 1;
  if (minutes <= expectedMinutes - 10) return -2;
  if (minutes <= expectedMinutes - 6) return -1;

  return 0;
}

function maybeCreateInjury(player: Player, minutes: number, fatigue: number, trainingFocus: TrainingFocus): PlayerInjury | null {
  const baseRisk = fatigue >= 85 ? 0.18 : fatigue >= 72 ? 0.1 : fatigue >= 60 ? 0.05 : 0.015;
  const minutesRisk = minutes >= 38 ? 0.08 : minutes >= 32 ? 0.04 : 0;
  const conditioningReduction = trainingFocus === 'Conditioning' ? 0.04 : 0;
  const risk = Math.max(0.005, baseRisk + minutesRisk - conditioningReduction);
  const roll = deterministicRiskRoll(player.id, minutes, fatigue, player.form, player.morale);

  if (roll > risk) return null;

  if (fatigue >= 88 && minutes >= 34) {
    return { type: 'Strained hamstring', severity: 'Minor', gamesRemaining: 3 };
  }

  if (fatigue >= 75) {
    return { type: 'Sore knee', severity: 'Minor', gamesRemaining: 2 };
  }

  return { type: 'Heavy knock', severity: 'Knock', gamesRemaining: 1 };
}

function progressInjury(injury: PlayerInjury | null, minutes: number): PlayerInjury | null {
  if (!injury) return null;

  const recovery = minutes <= 8 ? 1 : 0;
  const nextGamesRemaining = injury.gamesRemaining - recovery;

  if (nextGamesRemaining <= 0) return null;

  return { ...injury, gamesRemaining: nextGamesRemaining };
}

function getRoleExpectedMinutes(player: Player) {
  if (player.role === 'Starter') return 28;
  if (player.role === 'Rotation') return 16;
  if (player.role === 'Depth') return 7;
  return 4;
}

function createConditionNote(
  minutes: number,
  fatigueChange: number,
  formChange: number,
  moraleChange: number,
  injury: PlayerInjury | null,
  createdInjury: PlayerInjury | null,
) {
  if (createdInjury) return `${createdInjury.severity} injury: ${createdInjury.type}. Reduce minutes to help recovery.`;
  if (injury) return `${injury.type} still needs managing for ${injury.gamesRemaining} game${injury.gamesRemaining === 1 ? '' : 's'}.`;
  if (fatigueChange >= 6) return `Heavy ${minutes}-minute workload increased fatigue.`;
  if (moraleChange < 0) return `Limited role affected morale.`;
  if (formChange > 0) return `Useful minutes helped rhythm and form.`;
  if (fatigueChange < 0) return `Low minutes allowed recovery.`;

  return `Condition stayed steady.`;
}

function deterministicRiskRoll(...values: Array<string | number>) {
  const text = values.join(':');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  }

  return (hash % 1000) / 1000;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
