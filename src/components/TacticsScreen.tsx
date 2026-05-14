import { tacticOptions, type TacticalSettings } from '../game/tactics';
import {
  getRotationEntry,
  getRotationWarnings,
  getSortedRotationPlayers,
  getTotalRotationMinutes,
  normaliseRotation,
  STARTER_COUNT,
  TARGET_TEAM_MINUTES,
  updateRotationMinutes,
  updateRotationStarter,
} from '../game/rotation';
import type { Player, RotationPlan, Team } from '../types/basketball';

type TacticsScreenProps = {
  team: Team;
  tactics: TacticalSettings;
  rotationPlan: RotationPlan;
  onRotationChange: (nextRotation: RotationPlan) => void;
  onTacticsChange: (nextTactics: TacticalSettings) => void;
};

const tacticalGroups = [
  {
    key: 'pace',
    label: 'Pace',
    helper: 'Controls how quickly your team looks to attack after winning possession.',
  },
  {
    key: 'offensiveFocus',
    label: 'Offensive Focus',
    helper: 'Decides where your best scoring chances should come from.',
  },
  {
    key: 'defensiveStyle',
    label: 'Defensive Style',
    helper: 'Sets the base defensive structure before future match engine modifiers.',
  },
  {
    key: 'reboundingFocus',
    label: 'Rebounding Focus',
    helper: 'Balances transition defence against extra offensive rebound chances.',
  },
  {
    key: 'usageFocus',
    label: 'Usage Focus',
    helper: 'Controls who receives the most offensive possessions.',
  },
] as const;

export function TacticsScreen({ team, tactics, rotationPlan, onRotationChange, onTacticsChange }: TacticsScreenProps) {
  const rotation = normaliseRotation(team, rotationPlan);
  const starters = getSortedRotationPlayers(team, rotation).filter((player) => getRotationEntry(rotation, player.id)?.isStarter);
  const rotationPlayers = getSortedRotationPlayers(team, rotation).filter((player) => !getRotationEntry(rotation, player.id)?.isStarter);
  const leadGuard = starters.find((player) => player.position === 'PG') ?? starters[0];
  const interiorAnchor = starters.find((player) => player.position === 'C') ?? starters.at(-1);
  const warnings = getRotationWarnings(team, rotation);
  const totalMinutes = getTotalRotationMinutes(rotation);

  function handleStarterToggle(playerId: string, shouldStart: boolean) {
    onRotationChange(updateRotationStarter(team, rotation, playerId, shouldStart));
  }

  function handleMinutesChange(playerId: string, minutes: number) {
    onRotationChange(updateRotationMinutes(team, rotation, playerId, minutes));
  }

  return (
    <section className="tactics-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Tactical Setup</p>
          <h3>{team.name} game plan</h3>
          <p className="muted">Review your rotation, assign minutes and choose the tactical identity that feeds into match simulation.</p>
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
            <span className="chip">{starters.length}/{STARTER_COUNT} starters</span>
          </div>

          <div className="court-layout">
            {starters.map((player) => (
              <PlayerTile player={player} rotation={rotation} key={player.id} />
            ))}
          </div>
        </article>

        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Bench Rotation</p>
              <h3>Second unit</h3>
            </div>
            <span className="chip">{rotationPlayers.filter((player) => (getRotationEntry(rotation, player.id)?.minutes ?? 0) > 0).length} active bench</span>
          </div>
          <div className="rotation-list">
            {rotationPlayers.map((player) => (
              <RotationRow player={player} rotation={rotation} key={player.id} />
            ))}
          </div>
        </article>
      </section>

      <article className="panel tactics-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Rotation Manager</p>
            <h3>Minutes and starters</h3>
          </div>
          <span className={Math.abs(totalMinutes - TARGET_TEAM_MINUTES) <= 8 ? 'chip' : 'chip warning'}>{totalMinutes}/{TARGET_TEAM_MINUTES} minutes</span>
        </div>

        {warnings.length > 0 && (
          <div className="assistant-notes" style={{ marginBottom: '1rem' }}>
            {warnings.map((warning) => (
              <div className="assistant-note" key={warning}>
                <strong>Rotation warning</strong>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        <div className="roster-table">
          <div className="roster-row roster-row-header">
            <span>Player</span>
            <span>Pos</span>
            <span>Role</span>
            <span>Starter</span>
            <span>Minutes</span>
            <span>Fatigue</span>
          </div>

          {getSortedRotationPlayers(team, rotation).map((player) => {
            const entry = getRotationEntry(rotation, player.id)!;
            return (
              <div className="roster-row" key={player.id}>
                <div className="roster-player-cell">
                  <strong>{player.name}</strong>
                  <span>{player.archetype}</span>
                </div>
                <span className="position-pill">{player.position}</span>
                <span className={`role-pill role-${player.role.toLowerCase()}`}>{player.role}</span>
                <button
                  className={entry.isStarter ? 'option-button active' : 'option-button'}
                  onClick={() => handleStarterToggle(player.id, !entry.isStarter)}
                >
                  {entry.isStarter ? 'Starter' : 'Bench'}
                </button>
                <input
                  aria-label={`${player.name} expected minutes`}
                  className="minutes-input"
                  max={48}
                  min={0}
                  onChange={(event) => handleMinutesChange(player.id, Number(event.target.value))}
                  type="number"
                  value={entry.minutes}
                />
                <Meter value={player.fatigue ?? 0} />
              </div>
            );
          })}
        </div>
      </article>

      <section className="tactics-grid tactics-grid-wide">
        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Expected Effects</p>
              <h3>Pre-game preview</h3>
            </div>
            <span className="chip">Forecast</span>
          </div>
          <div className="assistant-notes">
            <Note title="Expected Pace" body={getExpectedPace(tactics.pace)} />
            <Note title="Variance" body={getExpectedVariance(tactics.offensiveFocus, tactics.defensiveStyle)} />
            <Note title="Fatigue Pressure" body={getFatiguePressure(tactics.pace, totalMinutes)} />
            <Note title="Rebounding Tradeoff" body={tactics.reboundingFocus === 'Crash Boards' ? 'More second-chance boards, weaker transition cover.' : 'Safer transition shape, fewer extra boards.'} />
          </div>
        </article>

        <article className="panel tactics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Tactical Controls</p>
              <h3>Match instructions</h3>
            </div>
            <span className="chip">Live modifiers</span>
          </div>

          <div className="tactical-control-list">
            {tacticalGroups.map((group) => (
              <div className="tactical-control" key={group.key}>
                <div>
                  <strong>{group.label}</strong>
                  <span>{group.helper}</span>
                </div>
                <div className="option-row">
                  {tacticOptions[group.key].map((option) => (
                    <button
                      className={option === tactics[group.key] ? 'option-button active' : 'option-button'}
                      key={option}
                      onClick={() => onTacticsChange({ ...tactics, [group.key]: option })}
                    >
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
            <Note title="Primary handler" body={`${leadGuard?.name ?? 'Your lead guard'} should control tempo and organise early offence.`} />
            <Note title="Interior anchor" body={`${interiorAnchor?.name ?? 'Your centre'} gives the side its defensive base around the rim.`} />
            <Note title="Current plan" body={`${tactics.pace} pace, ${tactics.offensiveFocus.toLowerCase()} offence, ${tactics.defensiveStyle.toLowerCase()} defence.`} />
            <Note title="Minutes plan" body={`Current expected workload is ${totalMinutes} team minutes. Target is ${TARGET_TEAM_MINUTES}.`} />
          </div>
        </article>
      </section>
    </section>
  );
}

type PlayerTileProps = {
  player: Player;
  rotation: RotationPlan;
};

function PlayerTile({ player, rotation }: PlayerTileProps) {
  const entry = getRotationEntry(rotation, player.id);

  return (
    <div className="player-tile">
      <span className="position-pill">{player.position}</span>
      <strong>{player.name}</strong>
      <span>{player.archetype}</span>
      <div className="tile-rating-row">
        <small>OVR {player.overall}</small>
        <small>{entry?.minutes ?? 0} MIN</small>
      </div>
    </div>
  );
}

type RotationRowProps = {
  player: Player;
  rotation: RotationPlan;
};

function RotationRow({ player, rotation }: RotationRowProps) {
  const entry = getRotationEntry(rotation, player.id);

  return (
    <div className="rotation-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.position} · {player.archetype}</span>
      </div>
      <span className={`role-pill role-${player.role.toLowerCase()}`}>{player.role}</span>
      <strong>{entry?.minutes ?? 0} MIN</strong>
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

function getExpectedPace(pace: TacticalSettings['pace']) {
  if (pace === 'Fast') return 'High-possession game with quicker shots and transitions.';
  if (pace === 'Slow') return 'Controlled tempo with fewer possessions and lower score volatility.';
  return 'Balanced pace with moderate possession count.';
}

function getExpectedVariance(offense: TacticalSettings['offensiveFocus'], defense: TacticalSettings['defensiveStyle']) {
  if (offense === 'Three-Point Heavy' || defense === 'Press') return 'Higher swing outcomes; hot/cold stretches are more likely.';
  if (offense === 'Inside' && defense === 'Zone') return 'Moderate variance; efficiency depends on paint control.';
  return 'Stable variance profile with fewer extreme score swings.';
}

function getFatiguePressure(pace: TacticalSettings['pace'], totalMinutes: number) {
  if (pace === 'Fast' && totalMinutes < TARGET_TEAM_MINUTES - 6) return 'High fatigue risk from fast pace and short rotation.';
  if (pace === 'Fast') return 'Moderate-high fatigue pressure; monitor heavy-minute players.';
  if (pace === 'Slow') return 'Lower fatigue pressure and steadier workloads.';
  return 'Moderate fatigue pressure.';
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
