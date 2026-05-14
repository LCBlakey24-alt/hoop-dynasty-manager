import { TeamLogo } from './TeamLogo';
import { getTeamProfile } from '../data/teamProfiles';
import type { Team } from '../types/basketball';

type TeamSelectScreenProps = {
  selectedTeamId: string;
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
};

export function TeamSelectScreen({ selectedTeamId, teams, onSelectTeam }: TeamSelectScreenProps) {
  const highestReputation = [...teams].sort((a, b) => b.reputation - a.reputation)[0];
  const mostHistoric = [...teams].sort((a, b) => b.championships - a.championships)[0];
  const bestRebuild = [...teams].sort((a, b) => a.reputation - b.reputation || a.championships - b.championships)[0];
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];

  return (
    <section className="team-select-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">New Save Setup</p>
          <h3>Choose your BSBL team</h3>
          <p className="muted">Pick a club with its own arena, culture, rivalries and basketball identity.</p>
        </div>
        <span className="chip">{teams.length} clubs</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Selected" value={selectedTeam?.shortName ?? '—'} helper={selectedTeam?.name ?? 'Choose a club'} />
        <SummaryCard label="Highest Rep" value={highestReputation.shortName} helper={`${highestReputation.name} · REP ${highestReputation.reputation}`} />
        <SummaryCard label="Most Historic" value={mostHistoric.shortName} helper={`${mostHistoric.championships} historical titles`} />
        <SummaryCard label="Rebuild Pick" value={bestRebuild.shortName} helper={`${bestRebuild.name} · ${getDifficultyLabel(bestRebuild)}`} />
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Club Selection Guide</p>
            <h3>Pick your story</h3>
          </div>
          <span className="chip">Manager setup</span>
        </div>
        <div className="assistant-notes">
          <GuideNote title="Win now" body="Choose a high-reputation club if you want pressure, better players and immediate expectations." />
          <GuideNote title="Build slowly" body="Choose a low-reputation club if you want a harder rebuild with more room to create a legacy." />
          <GuideNote title="Style first" body="Pick based on play style if you care more about identity than difficulty." />
        </div>
      </article>

      <section className="team-select-grid">
        {teams.map((team) => {
          const isSelected = selectedTeamId === team.id;
          const profile = getTeamProfile(team.id);
          const difficulty = getDifficultyLabel(team);
          const identityTag = getIdentityTag(team);

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
                <span>{difficulty}</span>
                <span>{identityTag}</span>
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

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="panel roster-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

function GuideNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function getDifficultyLabel(team: Team) {
  if (team.reputation >= 78) return 'Win Now';
  if (team.reputation >= 70) return 'Playoff Push';
  if (team.reputation >= 64) return 'Builder';
  return 'Hard Rebuild';
}

function getIdentityTag(team: Team) {
  const style = team.playStyle.toLowerCase();

  if (style.includes('fast') || style.includes('transition')) return 'Tempo Team';
  if (style.includes('three') || style.includes('spacing')) return 'Shooting Team';
  if (style.includes('defence') || style.includes('defense')) return 'Defensive Team';
  if (style.includes('rebounding') || style.includes('paint')) return 'Physical Team';
  if (style.includes('passing')) return 'System Team';
  return 'Balanced Team';
}
