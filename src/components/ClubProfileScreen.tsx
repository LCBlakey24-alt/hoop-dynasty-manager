import { getTeamProfile } from '../data/teamProfiles';
import type { Team } from '../types/basketball';

type ClubProfileScreenProps = {
  team: Team;
};

export function ClubProfileScreen({ team }: ClubProfileScreenProps) {
  const profile = getTeamProfile(team.id);

  if (!profile) {
    return (
      <section className="club-profile-screen">
        <div className="screen-heading">
          <div>
            <p className="eyebrow">Club Profile</p>
            <h3>{team.name}</h3>
            <p className="muted">No extended club profile has been added for this team yet.</p>
          </div>
          <span className="chip">{team.shortName}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="club-profile-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Club Profile</p>
          <h3>{team.name}</h3>
          <p className="muted">{team.legacyStory}</p>
        </div>
        <span className="chip">Founded {team.foundedYear}</span>
      </div>

      <section className="club-profile-grid">
        <article className="panel club-profile-hero">
          <div className="club-profile-badge" style={{ borderColor: team.primaryColor }}>
            {team.shortName}
          </div>
          <div>
            <p className="eyebrow">{team.city}, {team.nation}</p>
            <h3>{profile.arena}</h3>
            <p className="muted">{profile.motto}</p>
          </div>
        </article>

        <SummaryCard label="Titles" value={team.championships.toString()} helper="BSBL championships" />
        <SummaryCard label="Reputation" value={team.reputation.toString()} helper="Club standing" />
        <SummaryCard label="Style" value={team.playStyle} helper={profile.localStyle} />
      </section>

      <section className="club-profile-panels">
        <article className="panel club-profile-panel">
          <p className="eyebrow">Fan Culture</p>
          <h3>Home identity</h3>
          <p className="muted">{profile.fanCulture}</p>
        </article>

        <article className="panel club-profile-panel">
          <p className="eyebrow">Rivalries</p>
          <h3>Games circled on the calendar</h3>
          <div className="club-tag-list">
            {profile.rivalries.map((rivalry) => (
              <span key={rivalry}>{rivalry}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="club-profile-panels">
        <article className="panel club-profile-panel">
          <p className="eyebrow">Club Icons</p>
          <h3>Historic players</h3>
          <div className="club-tag-list">
            {team.historicPlayers.map((player) => (
              <span key={player}>{player}</span>
            ))}
          </div>
        </article>

        <article className="panel club-profile-panel">
          <p className="eyebrow">Club Kits</p>
          <h3>On-court identity</h3>
          <div className="club-tag-list">
            <span>Home: {profile.kits.home}</span>
            <span>Away: {profile.kits.away}</span>
            <span>Alt: {profile.kits.alternate}</span>
          </div>
        </article>

        <article className="panel club-profile-panel">
          <p className="eyebrow">Retired Numbers</p>
          <h3>Legacy honours</h3>
          <div className="club-tag-list">
            {profile.retiredNumbers.length ? profile.retiredNumbers.map((number) => (
              <span key={number}>#{number}</span>
            )) : <span>None retired yet</span>}
          </div>
        </article>

        <article className="panel club-profile-panel">
          <p className="eyebrow">Story Hooks</p>
          <h3>Dynasty narrative</h3>
          <div className="club-story-list">
            {profile.storyHooks.map((hook) => (
              <p key={hook}>{hook}</p>
            ))}
          </div>
        </article>
      </section>

      <article className="panel club-profile-panel country-style-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Country Style</p>
            <h3>{profile.countryStyle.country}: {profile.countryStyle.styleName}</h3>
          </div>
          <span className="chip">National identity</span>
        </div>
        <p className="muted">{profile.countryStyle.summary}</p>
        <div className="country-style-grid">
          <div>
            <strong>Strengths</strong>
            <div className="club-tag-list">
              {profile.countryStyle.strengths.map((strength) => (
                <span key={strength}>{strength}</span>
              ))}
            </div>
          </div>
          <div>
            <strong>Weaknesses</strong>
            <div className="club-tag-list">
              {profile.countryStyle.weaknesses.map((weakness) => (
                <span key={weakness}>{weakness}</span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
};

function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <article className="panel club-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}
