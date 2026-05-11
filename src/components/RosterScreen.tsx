import type { Player, Team } from '../types/basketball';

type RosterScreenProps = {
  team: Team;
};

const starterPositions = ['PG', 'SG', 'SF', 'PF', 'C'];

export function RosterScreen({ team }: RosterScreenProps) {
  const sortedRoster = [...team.roster].sort((a, b) => starterPositions.indexOf(a.position) - starterPositions.indexOf(b.position));
  const averageOverall = Math.round(average(team.roster.map((player) => player.overall)));
  const averagePotential = Math.round(average(team.roster.map((player) => player.potential)));
  const bestProspect = [...team.roster].sort((a, b) => b.potential - a.potential)[0];
  const squadLeader = [...team.roster].sort((a, b) => b.overall - a.overall)[0];

  return (
    <section className="roster-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Roster Management</p>
          <h3>{team.name} squad</h3>
          <p className="muted">Review your starting five, player roles, current ability, future ceiling and morale.</p>
        </div>
        <span className="chip">{team.roster.length} players seeded</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Avg Overall" value={averageOverall.toString()} helper="Current squad level" />
        <SummaryCard label="Avg Potential" value={averagePotential.toString()} helper="Future squad ceiling" />
        <SummaryCard label="Squad Leader" value={squadLeader.name} helper={`${squadLeader.overall} OVR · ${squadLeader.position}`} />
        <SummaryCard label="Top Prospect" value={bestProspect.name} helper={`${bestProspect.potential} POT · Age ${bestProspect.age}`} />
      </section>

      <article className="panel roster-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Starting Five</p>
            <h3>Current Rotation</h3>
          </div>
          <span className="chip">{team.playStyle}</span>
        </div>

        <div className="roster-table">
          <div className="roster-row roster-row-header">
            <span>Player</span>
            <span>Pos</span>
            <span>Age</span>
            <span>Role</span>
            <span>OVR</span>
            <span>POT</span>
            <span>Morale</span>
            <span>Form</span>
          </div>

          {sortedRoster.map((player) => (
            <RosterRow player={player} key={player.id} />
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
};

function RosterRow({ player }: RosterRowProps) {
  return (
    <div className="roster-row">
      <div className="roster-player-cell">
        <strong>{player.name}</strong>
        <span>{player.archetype}</span>
      </div>
      <span className="position-pill">{player.position}</span>
      <span>{player.age}</span>
      <span className="muted">Starter</span>
      <strong>{player.overall}</strong>
      <strong>{player.potential}</strong>
      <Meter value={player.morale} />
      <Meter value={player.form} />
    </div>
  );
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

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
