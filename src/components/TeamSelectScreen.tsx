import type { Team } from '../types/basketball';

type TeamSelectScreenProps = {
  selectedTeamId: string;
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
};

export function TeamSelectScreen({ selectedTeamId, teams, onSelectTeam }: TeamSelectScreenProps) {
  return (
    <section className="team-select-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">New Save Setup</p>
          <h3>Choose your BSBL team</h3>
          <p className="muted">Pick any fictional franchise. Your dashboard, roster, tactics and season view will follow this team.</p>
        </div>
        <span className="chip">12 clubs</span>
      </div>

      <section className="team-select-grid">
        {teams.map((team) => {
          const isSelected = selectedTeamId === team.id;

          return (
            <article className={isSelected ? 'panel team-select-card selected' : 'panel team-select-card'} key={team.id}>
              <div className="team-select-card-header">
                <span className="team-select-badge" style={{ borderColor: team.primaryColor }}>{team.shortName}</span>
                <div>
                  <p className="eyebrow">{team.nation}</p>
                  <h3>{team.name}</h3>
                  <span className="muted">{team.city}</span>
                </div>
              </div>

              <p className="team-select-copy">{team.identity}</p>

              <div className="team-select-meta">
                <span>{team.playStyle}</span>
                <span>REP {team.reputation}</span>
              </div>

              <button className={isSelected ? 'primary-action' : 'secondary-action'} onClick={() => onSelectTeam(team.id)}>
                {isSelected ? 'Selected Team' : 'Select Team'}
              </button>
            </article>
          );
        })}
      </section>
    </section>
  );
}
