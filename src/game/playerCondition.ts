import type { Player, PlayerConditionChange, RotationPlan, Team } from '../types/basketball';
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
    const fatigueChange = getFatigueChange(minutes, trainingFocus);
    const formChange = getFormChange(minutes, previousFatigue, trainingFocus);
    const moraleChange = getMoraleChange(player, minutes);
    const nextFatigue = clamp(previousFatigue + fatigueChange, 0, 99);
    const nextForm = clamp(player.form + formChange, 40, 99);
    const nextMorale = clamp(player.morale + moraleChange, 40, 99);

    changes.push({
      playerId: player.id,
      playerName: player.name,
      minutes,
      fatigueChange,
      formChange,
      moraleChange,
      nextFatigue,
      nextForm,
      nextMorale,
      note: createConditionNote(minutes, fatigueChange, formChange, moraleChange),
    });

    return {
      ...player,
      fatigue: nextFatigue,
      form: nextForm,
      morale: nextMorale,
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

function getFatigueChange(minutes: number, trainingFocus: TrainingFocus) {
  const conditioningReduction = trainingFocus === 'Conditioning' ? 2 : 0;

  if (minutes >= 38) return 8 - conditioningReduction;
  if (minutes >= 32) return 5 - conditioningReduction;
  if (minutes >= 24) return 3 - conditioningReduction;
  if (minutes >= 12) return 1 - conditioningReduction;

  return -3;
}

function getFormChange(minutes: number, currentFatigue: number, trainingFocus: TrainingFocus) {
  let change = 0;

  if (minutes >= 18 && minutes <= 34) change += 1;
  if (minutes >= 38 || currentFatigue >= 75) change -= 2;
  if (trainingFocus === 'Offense' || trainingFocus === 'Defense') change += 1;
  if (trainingFocus === 'Conditioning' && currentFatigue >= 50) change += 1;

  return change;
}

function getMoraleChange(player: Player, minutes: number) {
  const expectedMinutes = getRoleExpectedMinutes(player);

  if (minutes >= expectedMinutes + 6) return 1;
  if (minutes <= expectedMinutes - 10) return -2;
  if (minutes <= expectedMinutes - 6) return -1;

  return 0;
}

function getRoleExpectedMinutes(player: Player) {
  if (player.role === 'Starter') return 28;
  if (player.role === 'Rotation') return 16;
  if (player.role === 'Depth') return 7;
  return 4;
}

function createConditionNote(minutes: number, fatigueChange: number, formChange: number, moraleChange: number) {
  if (fatigueChange >= 6) return `Heavy ${minutes}-minute workload increased fatigue.`;
  if (moraleChange < 0) return `Limited role affected morale.`;
  if (formChange > 0) return `Useful minutes helped rhythm and form.`;
  if (fatigueChange < 0) return `Low minutes allowed recovery.`;

  return `Condition stayed steady.`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
