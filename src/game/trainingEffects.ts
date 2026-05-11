import type { TrainingFocus } from '../components/TrainingScreen';
import type { Team } from '../types/basketball';

export function applyTrainingFocus(team: Team, trainingFocus: TrainingFocus): Team {
  return {
    ...team,
    roster: team.roster.map((player) => {
      if (trainingFocus === 'Offense') {
        return {
          ...player,
          form: clampRating(player.form + 3),
          morale: clampRating(player.morale + 1),
        };
      }

      if (trainingFocus === 'Defense') {
        return {
          ...player,
          form: clampRating(player.form + 2),
          morale: clampRating(player.morale + 2),
        };
      }

      if (trainingFocus === 'Conditioning') {
        return {
          ...player,
          form: clampRating(player.form + 1),
          morale: clampRating(player.morale + 3),
        };
      }

      return {
        ...player,
        form: clampRating(player.form + 1),
        morale: clampRating(player.morale + 1),
      };
    }),
  };
}

function clampRating(value: number) {
  return Math.max(1, Math.min(99, value));
}
