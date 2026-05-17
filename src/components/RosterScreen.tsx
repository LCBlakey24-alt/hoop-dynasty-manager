import { useState } from 'react';
import { getTeamProfile } from '../data/teamProfiles';
import { derivePlayerAttributes, getAttributeLabel, type AttributeKey } from '../game/playerAttributes';
import type { SimulatedGameResult } from '../game/simulateGame';
import type { Player, PlayerRole, Team } from '../types/basketball';

type RosterScreenProps = {
  team: Team;
  results: SimulatedGameResult[];
  onChangePlayerPosition: (playerId: string, position: Player['position']) => void;
};

const roleOrder: Record<PlayerRole, number> = {
  Starter: 1,
  Rotation: 2,
  Depth: 3,
  Prospect: 4,
};

const featuredAttributes: AttributeKey[] = ['shooting', 'finishing', 'passing', 'rebounding', 'perimeterDefence', 'basketballIq'];

export function RosterScreen({ team, results, onChangePlayerPosition }: RosterScreenProps) {
  const [filter, setFilter] = useState<'All' | 'Starters' | 'Tired' | 'Injured' | 'High Upside'>('All');
  const [sortBy, setSortBy] = useState<'Role' | 'OVR' | 'POT' | 'Age' | 'PPG'>('Role');
  const profile = getTeamProfile(team.id);
  const sortedRoster = [...team.roster].sort((a, b) => {
    if (sortBy === 'OVR') return b.overall - a.overall;
    if (sortBy === 'POT') return b.potential - a.potential;
    if (sortBy === 'Age') return a.age - b.age;
    if (sortBy === 'PPG') return getPlayerAverages(b.id, results).ppg - getPlayerAverages(a.id, results).ppg;
    return roleOrder[a.role] - roleOrder[b.role] || b.overall - a.overall;
  });
  const filteredRoster = sortedRoster.filter((player) => {
    if (filter === 'Starters') return player.role === 'Starter';
    if (filter === 'Tired') return (player.fatigue ?? 0) >= 65;
    if (filter === 'Injured') return Boolean(player.injury);
    if (filter === 'High Upside') return player.potential - player.overall >= 8;
    return true;
  });
  const averageOverall = Math.round(average(team.roster.map((player) => player.overall)));
  const averagePotential = Math.round(average(team.roster.map((player) => player.potential)));
  const bestProspect = [...team.roster].sort((a, b) => b.potential - a.potential)[0];
  const squadLeader = [...team.roster].sort((a, b) => b.overall - a.overall)[0];
  const starters = team.roster.filter((player) => player.role === 'Starter').length;
  const tiredPlayers = team.roster.filter((player) => (player.fatigue ?? 0) >= 65);
  const injuredPlayers = team.roster.filter((player) => player.injury);
  const readyToGrow = team.roster.filter((player) => (player.developmentProgress ?? 0) >= 75 && player.overall < player.potential);
  const attributeLeaders = featuredAttributes.map((attribute) => getAttributeLeader(team.roster, attribute));

  return (
    <section className="roster-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Roster Management</p>
          <h3>{team.name} squad</h3>
          <p className="muted">Review your starters, bench rotation, depth pieces, prospects and squad morale.</p>
        </div>
        <span className="chip">{team.roster.length} players · {starters} starters</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Avg Overall" value={averageOverall.toString()} helper="Current squad level" />
        <SummaryCard label="Avg Potential" value={averagePotential.toString()} helper="Future squad ceiling" />
        <SummaryCard label="Fitness Watch" value={(tiredPlayers.length + injuredPlayers.length).toString()} helper={`${tiredPlayers.length} tired · ${injuredPlayers.length} injured`} />
        <SummaryCard label="Near Growth" value={readyToGrow.length.toString()} helper="75%+ development" />
      </section>

      <section className="result-grid">
        <article className="panel roster-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Squad Notes</p>
              <h3>Assistant view</h3>
            </div>
            <span className="chip">Staff report</span>
          </div>

          <div className="assistant-notes">
            {createSquadNotes(team).map((note) => (
              <div className="assistant-note" key={note.title}>
                <strong>{note.title}</strong>
                <span>{note.body}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel roster-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Core Players</p>
              <h3>Leadership and ceiling</h3>
            </div>
            <span className="chip">Squad view</span>
          </div>

          <div className="assistant-notes">
            <div className="assistant-note">
              <strong>Squad Leader</strong>
              <span>{squadLeader.name} leads the roster at {squadLeader.overall} OVR.</span>
            </div>
            <div className="assistant-note">
              <strong>Top Prospect</strong>
              <span>{bestProspect.name} has the highest ceiling at {bestProspect.potential} POT.</span>
            </div>
          </div>
        </article>
      </section>

      <article className="panel roster-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Attribute Leaders</p>
            <h3>Squad strengths</h3>
          </div>
          <span className="chip">Derived ratings</span>
        </div>

        <div className="attribute-leader-grid">
          {attributeLeaders.map((leader) => (
            <div className="attribute-leader-card" key={leader.attribute}>
              <p className="eyebrow">{getAttributeLabel(leader.attribute)}</p>
              <strong>{leader.player.name}</strong>
              <span>{leader.player.position} · {leader.player.archetype}</span>
              <em>{leader.value}</em>
            </div>
          ))}
        </div>
      </article>

      <article className="panel roster-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Club Identity</p>
            <h3>{team.shortName} legacy</h3>
          </div>
          <span className="chip">Founded {team.foundedYear}</span>
        </div>

        <div className="assistant-notes">
          {profile && (
            <>
              <div className="assistant-note">
                <strong>Arena</strong>
                <span>{profile.arena} · {profile.motto}</span>
              </div>
              <div className="assistant-note">
                <strong>Fan Culture</strong>
                <span>{profile.fanCulture}</span>
              </div>
              <div className="assistant-note">
                <strong>Rivalries</strong>
                <span>{profile.rivalries.join(' · ')}</span>
              </div>
              <div className="assistant-note">
                <strong>Local Style</strong>
                <span>{profile.localStyle}</span>
              </div>
            </>
          )}
          <div className="assistant-note">
            <strong>Championship Banners</strong>
            <span>{team.championships} title{team.championships === 1 ? '' : 's'} won.</span>
          </div>
          <div className="assistant-note">
            <strong>Franchise Identity</strong>
            <span>{team.identity}</span>
          </div>
          <div className="assistant-note">
            <strong>Legacy Story</strong>
            <span>{team.legacyStory}</span>
          </div>
          <div className="assistant-note">
            <strong>Historic Players</strong>
            <span>{team.historicPlayers.join(' · ')}</span>
          </div>
        </div>
      </article>

      <article className="panel roster-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Full Squad</p>
            <h3>Current Rotation</h3>
          </div>
          <span className="chip">{team.playStyle}</span>
        </div>

        <div className="roster-table">
          <div className="option-row" style={{ marginBottom: '1rem' }}>
            {(['All', 'Starters', 'Tired', 'Injured', 'High Upside'] as const).map((option) => (
              <button className={filter === option ? 'option-button active' : 'option-button'} key={option} onClick={() => setFilter(option)}>
                {option}
              </button>
            ))}
          </div>
          <div className="option-row" style={{ marginBottom: '1rem' }}>
            {(['Role', 'OVR', 'POT', 'Age', 'PPG'] as const).map((option) => (
              <button className={sortBy === option ? 'option-button active' : 'option-button'} key={option} onClick={() => setSortBy(option)}>
                Sort: {option}
              </button>
            ))}
          </div>
          <div className="roster-row roster-row-header">
            <span>Player</span>
            <span>Pos</span>
            <span>Age</span>
            <span>Role</span>
            <span>OVR</span>
            <span>POT</span>
            <span>Development</span>
            <span>Form</span>
            <span>Stats</span>
          </div>

          {filteredRoster.map((player) => (
            <RosterRow player={player} key={player.id} results={results} onChangePlayerPosition={onChangePlayerPosition} />
          ))}
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
    <article className="panel roster-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

type RosterRowProps = {
  player: Player;
  results: SimulatedGameResult[];
  onChangePlayerPosition: (playerId: string, position: Player['position']) => void;
};

function RosterRow({ player, results, onChangePlayerPosition }: RosterRowProps) {
  const stats = getPlayerAverages(player.id, results);
  return (
    <div className="roster-row">
      <div className="roster-player-cell">
        <strong>{player.name}</strong>
        <span>{player.archetype} · {getPlayerStatusTag(player)} · {getPlayerRecommendation(player)}</span>
      </div>
      <span className="position-pill">
        <select value={player.position} onChange={(event) => onChangePlayerPosition(player.id, event.target.value as Player['position'])}>
          {(['PG', 'SG', 'SF', 'PF', 'C'] as const).map((position) => (
            <option key={position} value={position}>{position}</option>
          ))}
        </select>
      </span>
      <span>{player.age}</span>
      <span className={`role-pill role-${player.role.toLowerCase()}`}>{player.role}</span>
      <strong>{player.overall}</strong>
      <strong>{player.potential}</strong>
      <Meter value={player.developmentProgress ?? 0} />
      <Meter value={player.form} />
      <span>{stats.ppg.toFixed(1)} / {stats.rpg.toFixed(1)} / {stats.apg.toFixed(1)}</span>
    </div>
  );
}

function getPlayerAverages(playerId: string, results: SimulatedGameResult[]) {
  const boxScores = results.flatMap((result) => [...(result.homeBoxScore ?? []), ...(result.awayBoxScore ?? [])])
    .filter((player) => player.playerId === playerId);
  const games = boxScores.length;
  if (!games) return { ppg: 0, rpg: 0, apg: 0 };
  const points = boxScores.reduce((total, entry) => total + entry.points, 0);
  const rebounds = boxScores.reduce((total, entry) => total + entry.rebounds, 0);
  const assists = boxScores.reduce((total, entry) => total + entry.assists, 0);
  return { ppg: points / games, rpg: rebounds / games, apg: assists / games };
}

function getPlayerRecommendation(player: Player) {
  if (player.injury) return 'LIMIT MINUTES';
  if ((player.fatigue ?? 0) >= 75) return 'REST RISK';
  if ((player.potential - player.overall) >= 10) return 'DEVELOPMENT PRIORITY';
  if (player.role === 'Starter' && player.overall >= 75) return 'START NOW';
  return 'STEADY ROLE';
}

type MeterProps = {
  value: number;
};

function Meter({ value }: MeterProps) {
  return (
    <div className="meter-cell" aria-label={`${value} out of 100`}>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
      <span>{value}</span>
    </div>
  );
}

function createSquadNotes(team: Team) {
  const injuredPlayers = team.roster.filter((player) => player.injury);
  const tiredPlayers = team.roster.filter((player) => (player.fatigue ?? 0) >= 65);
  const nearGrowth = team.roster.filter((player) => (player.developmentProgress ?? 0) >= 75 && player.overall < player.potential);
  const unfulfilledProspects = team.roster
    .filter((player) => player.potential - player.overall >= 10)
    .sort((a, b) => b.potential - b.overall - (a.potential - a.overall));
  const notes = [];

  if (injuredPlayers.length > 0) {
    notes.push({ title: 'Medical watch', body: `${injuredPlayers[0].name} is carrying ${injuredPlayers[0].injury?.type}. Protect minutes until they recover.` });
  }

  if (tiredPlayers.length > 0) {
    notes.push({ title: 'Fatigue watch', body: `${tiredPlayers[0].name} is at ${tiredPlayers[0].fatigue ?? 0} fatigue. Consider rest or a lower workload.` });
  }

  if (nearGrowth.length > 0) {
    notes.push({ title: 'Development push', body: `${nearGrowth[0].name} is close to an OVR improvement. Meaningful minutes could help.` });
  }

  if (unfulfilledProspects.length > 0) {
    notes.push({ title: 'Upside player', body: `${unfulfilledProspects[0].name} has a +${unfulfilledProspects[0].potential - unfulfilledProspects[0].overall} potential gap. Build a pathway if possible.` });
  }

  if (notes.length === 0) {
    notes.push({ title: 'Squad stable', body: 'No major fitness or development concerns. Maintain rotation balance and protect morale.' });
  }

  return notes;
}

function getPlayerStatusTag(player: Player) {
  if (player.injury) return `${player.injury.severity}: ${player.injury.type}`;
  if ((player.fatigue ?? 0) >= 80) return 'Exhausted';
  if ((player.fatigue ?? 0) >= 65) return 'Tired';
  if ((player.developmentProgress ?? 0) >= 75 && player.overall < player.potential) return 'Near growth';
  if (player.potential - player.overall >= 10) return 'High upside';
  if (player.form >= 78) return 'In form';
  if (player.form <= 60) return 'Cold form';
  return 'Stable';
}

function getAttributeLeader(players: Player[], attribute: AttributeKey) {
  return players
    .map((player) => ({ player, value: derivePlayerAttributes(player)[attribute], attribute }))
    .sort((a, b) => b.value - a.value)[0];
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
