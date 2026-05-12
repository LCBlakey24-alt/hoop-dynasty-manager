import type { Team } from '../types/basketball';

export type TrainingFocus = 'Balanced' | 'Offense' | 'Defense' | 'Conditioning';

type TrainingScreenProps = {
  team: Team;
  trainingFocus: TrainingFocus;
  onTrainingFocusChange: (focus: TrainingFocus) => void;
};

const focusOptions: { focus: TrainingFocus; summary: string }[] = [
  { focus: 'Balanced', summary: 'Small boost to morale and form with no tradeoff.' },
  { focus: 'Offense', summary: 'Higher scoring form, but slight defensive concentration drop.' },
  { focus: 'Defense', summary: 'Better defensive readiness and rebounding discipline.' },
  { focus: 'Conditioning', summary: 'Improves consistency and recovery for late-season stretches.' },
];

export function TrainingScreen({ team, trainingFocus, onTrainingFocusChange }: TrainingScreenProps) {
  return (
    <section className="tactics-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Training</p>
          <h3>{team.name} weekly training plan</h3>
          <p className="muted">Set a focus that applies a subtle simulation modifier to your team each game.</p>
        </div>
        <span className="chip">{trainingFocus}</span>
      </div>

      <article className="panel tactics-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Training Focus</p>
            <h3>Manager decision</h3>
          </div>
          <span className="chip">Weekly</span>
        </div>

        <div className="tactical-control-list">
          {focusOptions.map((option) => (
            <div className="tactical-control" key={option.focus}>
              <div>
                <strong>{option.focus}</strong>
                <span>{option.summary}</span>
              </div>
              <button
                className={trainingFocus === option.focus ? 'option-button active' : 'option-button'}
                onClick={() => onTrainingFocusChange(option.focus)}
              >
                {trainingFocus === option.focus ? 'Active' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
