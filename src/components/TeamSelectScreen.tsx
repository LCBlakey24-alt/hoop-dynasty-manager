import { useEffect, useState } from 'react';
import { TeamLogo } from './TeamLogo';
import { getTeamProfile } from '../data/teamProfiles';
import { careerTracks } from '../data/careerPathways';
import { leagueExpansionProfiles } from '../data/worldBasketball';
import type { Team } from '../types/basketball';

type TeamSelectScreenProps = {
  selectedTeamId: string;
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  onCreateCustomTeam: (input: {
    baseTeamId: string;
    name: string;
    city: string;
    shortName: string;
    tier: 'Top' | 'Mid' | 'Bottom';
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    logoUrl?: string;
    miniLogoUrl?: string;
  }) => void;
};

export function TeamSelectScreen({ selectedTeamId, teams, onSelectTeam, onCreateCustomTeam }: TeamSelectScreenProps) {
  const [customTier, setCustomTier] = useState<'Top' | 'Mid' | 'Bottom'>('Mid');
  const [customName, setCustomName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customShortName, setCustomShortName] = useState('');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#f97316');
  const [customSecondaryColor, setCustomSecondaryColor] = useState('#0b1020');
  const [customTertiaryColor, setCustomTertiaryColor] = useState('#38bdf8');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | undefined>(undefined);
  const [customMiniLogoUrl, setCustomMiniLogoUrl] = useState<string | undefined>(undefined);
  const [expansionFilter, setExpansionFilter] = useState<'All' | 'Playable' | 'In Development' | 'Planned'>('All');
  const highestReputation = [...teams].sort((a, b) => b.reputation - a.reputation)[0];
  const mostHistoric = [...teams].sort((a, b) => b.championships - a.championships)[0];
  const bestRebuild = [...teams].sort((a, b) => a.reputation - b.reputation || a.championships - b.championships)[0];
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];

  useEffect(() => {
    setCustomName(`${selectedTeam.city} Custom`);
    setCustomCity(selectedTeam.city);
    setCustomShortName(selectedTeam.shortName);
    setCustomPrimaryColor(selectedTeam.primaryColor);
    setCustomSecondaryColor(selectedTeam.secondaryColor);
    setCustomTertiaryColor(selectedTeam.tertiaryColor ?? '#38bdf8');
    setCustomLogoUrl(selectedTeam.logoUrl);
    setCustomMiniLogoUrl(selectedTeam.miniLogoUrl);
  }, [selectedTeam.id]);

  function handleUpload(file: File | null, setter: (value: string | undefined) => void) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  }

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

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Career Lab</p>
            <h3>Playable progression targets</h3>
          </div>
          <span className="chip">Mode planning</span>
        </div>
        <div className="assistant-notes">
          {careerTracks.map((track) => (
            <div className="assistant-note" key={track.id}>
              <strong>{track.title}</strong>
              <span>{track.summary}</span>
              <span>Next playable milestone: {track.stages[0]?.stage ?? track.entryStage}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Global League Expansion</p>
            <h3>Play beyond one country</h3>
          </div>
          <span className="chip">Road to world mode</span>
        </div>
        <div className="option-row" style={{ marginBottom: '0.75rem' }}>
          {(['All', 'Playable', 'In Development', 'Planned'] as const).map((status) => (
            <button
              className={expansionFilter === status ? 'option-button active' : 'option-button'}
              key={status}
              onClick={() => setExpansionFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="assistant-notes">
          {leagueExpansionProfiles.filter((league) => expansionFilter === 'All' ? true : league.status === expansionFilter).map((league) => (
            <div className="assistant-note" key={league.leagueId}>
              <strong>{league.leagueName} · {league.country} · {league.status}</strong>
              <span>
                Palette:
                <span style={{ display: 'inline-flex', gap: '0.35rem', marginLeft: '0.35rem', verticalAlign: 'middle' }}>
                  <span title="Primary" style={{ width: '0.9rem', height: '0.9rem', borderRadius: '999px', background: league.palette.primary, border: '1px solid rgba(255,255,255,0.4)' }} />
                  <span title="Secondary" style={{ width: '0.9rem', height: '0.9rem', borderRadius: '999px', background: league.palette.secondary, border: '1px solid rgba(255,255,255,0.4)' }} />
                  <span title="Tertiary" style={{ width: '0.9rem', height: '0.9rem', borderRadius: '999px', background: league.palette.tertiary, border: '1px solid rgba(255,255,255,0.4)' }} />
                </span>
              </span>
              <span>{league.styleIdentity}</span>
              <span>{league.signingModel}</span>
              <span>{league.talentPipeline}</span>
            </div>
          ))}
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
                <TeamLogo teamId={team.id} teamName={team.name} logoSrc={team.logoUrl} size={76} className="team-select-logo" />
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
              {isSelected && (
                <>
                  <div className="option-row" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                    {(['Top', 'Mid', 'Bottom'] as const).map((tier) => (
                      <button
                        className={customTier === tier ? 'option-button active' : 'option-button'}
                        key={tier}
                        onClick={() => setCustomTier(tier)}
                      >
                        Start {tier}
                      </button>
                    ))}
                  </div>
                  <div className="assistant-note" style={{ marginBottom: '0.75rem' }}>
                    <strong>Custom Club Setup</strong>
                    <div className="option-row" style={{ marginTop: '0.5rem' }}>
                      <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Club name" />
                      <input value={customCity} onChange={(event) => setCustomCity(event.target.value)} placeholder="City" />
                      <input value={customShortName} onChange={(event) => setCustomShortName(event.target.value.toUpperCase().slice(0, 3))} placeholder="3-letter code" />
                    </div>
                    <div className="option-row" style={{ marginTop: '0.5rem' }}>
                      <label className="muted">Primary <input type="color" value={customPrimaryColor} onChange={(event) => setCustomPrimaryColor(event.target.value)} /></label>
                      <label className="muted">Secondary <input type="color" value={customSecondaryColor} onChange={(event) => setCustomSecondaryColor(event.target.value)} /></label>
                      <label className="muted">Tertiary <input type="color" value={customTertiaryColor} onChange={(event) => setCustomTertiaryColor(event.target.value)} /></label>
                    </div>
                    <div className="option-row" style={{ marginTop: '0.5rem' }}>
                      <label className="muted">Main Logo <input type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0] ?? null, setCustomLogoUrl)} /></label>
                      <label className="muted">Mini Logo <input type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0] ?? null, setCustomMiniLogoUrl)} /></label>
                    </div>
                  </div>
                  <button
                    className="secondary-action"
                    onClick={() => onCreateCustomTeam({
                      baseTeamId: team.id,
                      name: customName.trim() || `${team.city} Custom`,
                      city: customCity.trim() || team.city,
                      shortName: (customShortName.trim() || team.shortName).toUpperCase().slice(0, 3),
                      tier: customTier,
                      primaryColor: customPrimaryColor,
                      secondaryColor: customSecondaryColor,
                      tertiaryColor: customTertiaryColor,
                      logoUrl: customLogoUrl,
                      miniLogoUrl: customMiniLogoUrl,
                    })}
                  >
                    Create Custom Club From This Slot
                  </button>
                </>
              )}
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
