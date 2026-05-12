import type { TrainingFocus } from '../components/TrainingScreen';
import type { Team } from '../types/basketball';

export function applyTrainingFocus(team: Team, trainingFocus: TrainingFocus): Team {
  const adjust = { form: 0, morale: 0 };

  if (trainingFocus === 'Balanced') { adjust.form = 1; adjust.morale = 1; }
  if (trainingFocus === 'Offense') { adjust.form = 2; adjust.morale = 0; }
  if (trainingFocus === 'Defense') { adjust.form = 1; adjust.morale = 0; }
  if (trainingFocus === 'Conditioning') { adjust.form = 1; adjust.morale = 2; }

  return {
    ...team,
    roster: team.roster.map((player) => ({
      ...player,
      form: Math.max(40, Math.min(99, player.form + adjust.form)),
      morale: Math.max(40, Math.min(99, player.morale + adjust.morale)),
    })),
  };
}
