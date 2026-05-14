import type { Team } from '../types/basketball';

export type TrainingFocus = 'Balanced' | 'Offense' | 'Defense' | 'Conditioning';

type TrainingScreenProps = {
  team: Team;
  trainingFocus: TrainingFocus;
  onTrainingFocusChange: (focus: TrainingFocus) => void;
};

type FocusOption = {
  focus: TrainingFocus;
  summary: string;
  impact: string;
  bestUsedWhen: string;
  risk: string;
};

const focusOptions: FocusOption[] = [
  {
    focus: 'Balanced',
    summary: 'Small boost to morale and form with no tradeoff.',
    impact: 'Steady form and morale support.',
    bestUsedWhen: 'Your squad is stable and you do not need to chase a specific matchup edge.',
    risk: 'Lower peak benefit than a specialist focus.',
  },
  {
    focus: 'Offense',
    summary: 'Higher scoring form, but less recovery emphasis.',
    impact: 'Best for scoring rhythm and attacking confidence.',
    bestUsedWhen: 'You need more shot creation or your next matchup favours pace and scoring.',
    risk: 'Can leave tired players under-managed if fatigue is already high.',
  },
  {
    focus: 'Defense',
    summary: 'Better defensive readiness and rebounding discipline.',
    impact: 'Best for structure, stops and physical control.',
    bestUsedWhen: 'You are conceding too much or facing stronger opposition.',
    risk: 'May not solve poor scoring or low offensive form by itself.',
  },
  {
    focus: 'Conditioning',
    summary: 'Improves consistency and recovery for late-season stretches.',
    impact: 'Best for fatigue control and availability.',
    bestUsedWhen: 'Players are tired, injured, or the fixture load is building.',
    risk: 'Short-term performance boost is less direct than offense or defense.',
  },
];

export function TrainingScreen({ team, trainingFocus, onTrainingFocusChange }: TrainingScreenProps) {
  const activeFocus = focusOptions.find((option) => option.focus === trainingFocus) ?? focusOptions[0];
  const tiredPlayers = team.roster.filter((player) => (player.fatigue ?? 0) >= 65);
  const injuredPlayers = team.roster.filter((player) => player.injury);
  const developmentPlayers = team.roster.filter((player) => player.potential > player.overall);

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

      <section className="roster-summary-grid">
        <SummaryCard label="Active Focus" value={activeFocus.focus} helper={activeFocus.impact} />
        <SummaryCard label="Tired Players" value={tiredPlayers.length.toString()} helper="65+ fatigue" />
        <SummaryCard label="Injury Watch" value={injuredPlayers.length.toString()} helper="Players carrying injuries" />
        <SummaryCard label="Growth Group" value={developmentPlayers.length.toString()} helper="Players below potential" />
      </section>

      <section className="result-grid">
        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Current Plan</p>
              <h3>{activeFocus.focus} focus</h3>
            </div>
            <span className="chip">Active</span>
          </div>

          <div className="assistant-notes">
            <TrainingNote title="Impact" body={activeFocus.impact} />
            <TrainingNote title="Best used when" body={activeFocus.bestUsedWhen} />
            <TrainingNote title="Risk" body={activeFocus.risk} />
          </div>
        </article>

        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Staff Advice</p>
              <h3>Focus recommendation</h3>
            </div>
            <span className="chip">Assistant</span>
          </div>

          <div className="assistant-notes">
            {createTrainingAdvice(team).map((note) => (
              <TrainingNote body={note.body} key={note.title} title={note.title} />
            ))}
          </div>
        </article>
      </section>

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
                <span>{option.bestUsedWhen}</span>
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

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="panel roster-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

function TrainingNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function createTrainingAdvice(team: Team) {
  const tiredPlayers = team.roster.filter((player) => (player.fatigue ?? 0) >= 65);
  const injuredPlayers = team.roster.filter((player) => player.injury);
  const lowFormPlayers = team.roster.filter((player) => player.form <= 62);
  const highGrowthPlayers = team.roster.filter((player) => player.potential - player.overall >= 10);

  if (injuredPlayers.length > 0 || tiredPlayers.length >= 3) {
    return [
      { title: 'Recommended focus', body: 'Conditioning is the safest choice while fatigue or injuries are building.' },
      { title: 'Why', body: 'Tired players develop slower and carry higher injury risk when overworked.' },
    ];
  }

  if (lowFormPlayers.length >= 3) {
    return [
      { title: 'Recommended focus', body: 'Balanced training can stabilise morale and form across the squad.' },
      { title: 'Why', body: 'Several players are in low form, so a broad reset may be better than chasing one specialist edge.' },
    ];
  }

  if (highGrowthPlayers.length >= 3) {
    return [
      { title: 'Recommended focus', body: 'Balanced or Conditioning helps keep young players available for development minutes.' },
      { title: 'Why', body: 'High-upside players need consistent court time, but fatigue can slow progress.' },
    ];
  }

  return [
    { title: 'Recommended focus', body: 'Choose the focus that best suits your next matchup and tactical plan.' },
    { title: 'Why', body: 'No major fitness or form warning is currently forcing a specific training direction.' },
  ];
}
