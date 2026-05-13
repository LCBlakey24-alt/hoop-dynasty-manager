import { TeamLogo } from './TeamLogo';
import { getTeamProfile } from '../data/teamProfiles';
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
          <p className="muted">Pick a club with its own arena, culture, rivalries and basketball identity.</p>
        </div>
        <span className="chip">12 clubs</span>
      </div>

      <section className="team-select-grid">
        {teams.map((team) => {
          const isSelected = selectedTeamId === team.id;
          const profile = getTeamProfile(team.id);

          return (
            <article className={isSelected ? 'panel team-select-card selected' : 'panel team-select-card'} key={team.id}>
              <div className="team-select-card-header">
                <TeamLogo teamId={team.id} teamName={team.name} size={76} className="team-select-logo" />
                <div>
                  <p className="eyebrow">{team.nation}</p>
                  <h3>{team.name}</h3>
                  <span className="muted">{team.city} · Founded {team.foundedYear}</span>
                </div>
              </div>

              <p className="team-select-copy">{team.identity}</p>
              <p className="muted">{team.legacyStory}</p>

              {profile && (
                <div className="team-profile-mini">
                  <strong>{profile.arena}</strong>
                  <span>{profile.motto}</span>
                  <span>{profile.fanCulture}</span>
                  <span>Rivals: {profile.rivalries.join(' · ')}</span>
                </div>
              )}

              <div className="team-select-meta">
                <span>{team.playStyle}</span>
                <span>REP {team.reputation}</span>
                <span>{team.championships} Titles</span>
              </div>

              <div className="assistant-note" style={{ marginBottom: '1rem' }}>
                <strong>Club Icons</strong>
                <span>{team.historicPlayers.join(' · ')}</span>
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
