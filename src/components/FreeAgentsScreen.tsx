import { freeAgents } from '../data/freeAgents';
import { canSignFreeAgent, createFreeAgentContract, getFreeAgentFitLabel, getFreeAgentInterest } from '../game/freeAgents';
import { formatMoney } from '../game/contracts';
import type { Player, Team } from '../types/basketball';

type FreeAgentsScreenProps = {
  releasedPlayers: Player[];
  signedFreeAgentIds: string[];
  team: Team;
  onSignFreeAgent: (player: Player) => void;
};

export function FreeAgentsScreen({ releasedPlayers, signedFreeAgentIds, team, onSignFreeAgent }: FreeAgentsScreenProps) {
  const market = dedupePlayers([...freeAgents, ...releasedPlayers]);
  const availableFreeAgents = market.filter((player) => !signedFreeAgentIds.includes(player.id) && !team.roster.some((candidate) => candidate.id === player.id));
  const bestOverall = [...availableFreeAgents].sort((a, b) => b.overall - a.overall)[0];
  const bestProspect = [...availableFreeAgents].sort((a, b) => b.potential - a.potential)[0];
  const interestedCount = availableFreeAgents.filter((player) => getFreeAgentInterest(player, team) !== 'Unlikely').length;
  const openRosterSpots = Math.max(0, 14 - team.roster.length);

  return (
    <section className="roster-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Free Agents</p>
          <h3>Available players</h3>
          <p className="muted">Scout unsigned players, compare fit and add depth to your squad.</p>
        </div>
        <span className="chip">{availableFreeAgents.length} available</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Best Overall" value={bestOverall?.name ?? 'None'} helper={bestOverall ? `${bestOverall.overall} OVR · ${bestOverall.position}` : 'Market empty'} />
        <SummaryCard label="Best Prospect" value={bestProspect?.name ?? 'None'} helper={bestProspect ? `${bestProspect.potential} POT · Age ${bestProspect.age}` : 'Market empty'} />
        <SummaryCard label="Interested" value={interestedCount.toString()} helper="Open or better interest" />
        <SummaryCard label="Roster Space" value={openRosterSpots.toString()} helper="Suggested max squad: 14" />
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Market</p>
            <h3>Free agent pool</h3>
          </div>
          <span className="chip">{releasedPlayers.length ? `${releasedPlayers.length} released` : 'Board approval active'}</span>
        </div>

        <div className="box-score-list full-box-score-list">
          {availableFreeAgents.map((player) => (
            <FreeAgentRow key={player.id} player={player} team={team} onSignFreeAgent={onSignFreeAgent} isReleasedPlayer={releasedPlayers.some((released) => released.id === player.id)} />
          ))}
          {availableFreeAgents.length === 0 && (
            <div className="box-score-row">
              <div>
                <strong>Market empty</strong>
                <span>All current free agents have been signed.</span>
              </div>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function FreeAgentRow({ isReleasedPlayer, player, team, onSignFreeAgent }: { isReleasedPlayer: boolean; player: Player; team: Team; onSignFreeAgent: (player: Player) => void }) {
  const contract = createFreeAgentContract(player, team);
  const approval = canSignFreeAgent(player, team);
  const interest = getFreeAgentInterest(player, team);

  return (
    <div className="box-score-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.age} · {player.position} · {player.archetype} · {getFreeAgentFitLabel(player, team)}{isReleasedPlayer ? ' · Recently released' : ''}</span>
        <span>{approval.reason} · Projected wages: {formatMoney(approval.projectedWages)} / {formatMoney(approval.wageBudget)}</span>
      </div>
      <StatBlock label="OVR" value={player.overall.toString()} />
      <StatBlock label="POT" value={player.potential.toString()} />
      <StatBlock label="WAGE" value={formatMoney(contract.annualWage)} />
      <StatBlock label="INT" value={interest} />
      <button className={approval.approved ? 'option-button active' : 'option-button'} disabled={!approval.approved} onClick={() => onSignFreeAgent(player)}>
        {approval.approved ? 'Sign' : 'Blocked'}
      </button>
    </div>
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function dedupePlayers(players: Player[]) {
  const seenIds = new Set<string>();
  return players.filter((player) => {
    if (seenIds.has(player.id)) return false;
    seenIds.add(player.id);
    return true;
  });
}
