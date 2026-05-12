type LandingScreenProps = {
  hasSave: boolean;
  selectedTeamName: string;
  onContinue: () => void;
  onNewFranchise: () => void;
};

const comingSoonModes = [
  {
    title: 'Player Career',
    description: 'Create one player, earn minutes, chase awards and build a legacy across multiple teams.',
  },
  {
    title: 'Custom League',
    description: 'Build your own teams, formats, countries and fictional basketball universe.',
  },
  {
    title: 'Settings',
    description: 'Game speed, display preferences, save options and accessibility controls.',
  },
];

export function LandingScreen({ hasSave, selectedTeamName, onContinue, onNewFranchise }: LandingScreenProps) {
  return (
    <section className="landing-screen">
      <article className="landing-hero panel">
        <p className="eyebrow">Hoop Dynasty Manager</p>
        <h2>Build a basketball dynasty from the bench, the boardroom and the box score.</h2>
        <p className="landing-copy">
          Take charge of a fictional British basketball club, manage tactics, develop players, survive the season and chase the BSBL title.
        </p>
        <div className="landing-actions">
          <button className="primary-action" disabled={!hasSave} onClick={onContinue}>
            {hasSave ? `Continue ${selectedTeamName}` : 'No Save Found'}
          </button>
          <button className="secondary-action" onClick={onNewFranchise}>New Franchise</button>
        </div>
      </article>

      <section className="mode-card-grid">
        <article className="panel mode-card playable">
          <div>
            <p className="eyebrow">Playable Now</p>
            <h3>Franchise Mode</h3>
            <p>Choose a BSBL club, play a full season, manage tactics, simulate playoffs and crown a champion.</p>
          </div>
          <button className="primary-action" onClick={hasSave ? onContinue : onNewFranchise}>
            {hasSave ? 'Continue Franchise' : 'Start Franchise'}
          </button>
        </article>

        {comingSoonModes.map((mode) => (
          <article className="panel mode-card locked" key={mode.title}>
            <span className="coming-soon-banner">Coming Soon</span>
            <div>
              <p className="eyebrow">Future Mode</p>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
            </div>
            <button className="secondary-action" disabled>Locked</button>
          </article>
        ))}
      </section>
    </section>
  );
}
