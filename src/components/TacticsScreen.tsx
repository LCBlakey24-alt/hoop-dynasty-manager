import type { Player, Team } from '../types/basketball';

type TacticsScreenProps = {
  team: Team;
};

const tacticalGroups = [
  {
    label: 'Pace',
    current: 'Fast',
    options: ['Slow', 'Balanced', 'Fast'],
    helper: 'Controls how quickly your team looks to attack after winning possession.',
  },
  {
    label: 'Offensive Focus',
    current: 'Transition',
    options: ['Inside', 'Balanced', 'Three-Point Heavy', 'Transition'],
    helper: 'Decides where your best scoring chances should come from.',
  },
  {
    label: 'Defensive Style',
    current: 'Man-to-Man',
    options: ['Man-to-Man', 'Zone', 'Press'],
    helper: 'Sets the base defensive structure before future match engine modifiers.',
  },
  {
    label: 'Rebounding Focus',
    current: 'Balanced',
    options: ['Get Back', 'Balanced', 'Crash Boards'],
    helper: 'Balances transition defence against extra offensive rebound chances.',
  },
  {
    label: 'Usage Focus',
    current: 'Balanced',
    options: ['Balanced', 'Star Player', 'Guards', 'Bigs'],
    helper: 'Controls who receives the most offensive possessions.',
  },
];

export function TacticsScreen({ team }: TacticsScreenProps) {
  const starters = team.roster.filter((player) => player.role === 'Starter');
  const rotation = team.roster.filter((player) => player.role === 'Rotation');
  const depth = team.roster.filter((player) => player.role === 'Depth' || player.role === 'Prospect');
  const leadGuard = starters.find((player) => player.position === 'PG') ?? starters[0];
  const interiorAnchor = starters.find((player) => player.position === 'C') ?? starters.at(-1);

  return (
    <section className="tactics-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Tactical Setup</p>
          <h3>{team.name} game plan</h3>
          <p className="muted">Review your rotation and choose the tactical identity that will later feed into match simulation.</p>
        </div>
        <span className="chip">{team.playStyle}</span>
      </div>

      <section className="tactics-grid">
        <article className="panel tactics-panel court-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Starting Five</p>
              <h3>On-court unit</h3>
            </div>
            <span className="chip">5 starters</span>
          </div>

          <div className="court-layout">
            {starters.map((player) => (
              <PlayerTile player={player} key={player.id} />
            ))}
          </div>
        </article>

        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Bench Rotation</p>
              <h3>Second unit</h3>
            </div>
            <span className="chip">{rotation.length} rotation</span>
          </div>
          <div className="rotation-list">
            {rotation.map((player) => (
              <RotationRow player={player} key={player.id} />
            ))}
            {depth.map((player) => (
              <RotationRow player={player} key={player.id} />
            ))}
          </div>
        </article>
      </section>

      <section className="tactics-grid tactics-grid-wide">
        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Tactical Controls</p>
              <h3>Match instructions</h3>
            </div>
            <span className="chip">Prototype</span>
          </div>

          <div className="tactical-control-list">
            {tacticalGroups.map((group) => (
              <div className="tactical-control" key={group.label}>
                <div>
                  <strong>{group.label}</strong>
                  <span>{group.helper}</span>
                </div>
                <div className="option-row">
                  {group.options.map((option) => (
                    <button className={option === group.current ? 'option-button active' : 'option-button'} key={option}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Tactical Notes</p>
              <h3>Assistant view</h3>
            </div>
            <span className="chip">Scouting</span>
          </div>
          <div className="assistant-notes">
            <Note title="Primary handler" body={`${leadGuard.name} should control tempo and organise early offence.`} />
            <Note title="Interior anchor" body={`${interiorAnchor?.name ?? 'Your centre'} gives the side its defensive base around the rim.`} />
            <Note title="Current identity" body={`${team.playStyle} suits the current squad, but deeper tactical impact will be added in the simulator next.`} />
          </div>
        </article>
      </section>
    </section>
  );
}

type PlayerTileProps = {
  player: Player;
};

function PlayerTile({ player }: PlayerTileProps) {
  return (
    <div className="player-tile">
      <span className="position-pill">{player.position}</span>
      <strong>{player.name}</strong>
      <span>{player.archetype}</span>
      <div className="tile-rating-row">
        <small>OVR {player.overall}</small>
        <small>POT {player.potential}</small>
      </div>
    </div>
  );
}

type RotationRowProps = {
  player: Player;
};

function RotationRow({ player }: RotationRowProps) {
  return (
    <div className="rotation-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.position} · {player.archetype}</span>
      </div>
      <span className={`role-pill role-${player.role.toLowerCase()}`}>{player.role}</span>
      <strong>{player.overall}</strong>
    </div>
  );
}

type NoteProps = {
  title: string;
  body: string;
};

function Note({ title, body }: NoteProps) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
