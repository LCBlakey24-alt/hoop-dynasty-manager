import { freeAgents } from '../data/freeAgents';
import { canSignFreeAgent, createFreeAgentContract, getFreeAgentFitLabel, getFreeAgentInterest } from '../game/freeAgents';
import { formatMoney } from '../game/contracts';
import type { Player, Team } from '../types/basketball';

type FreeAgentsScreenProps = {
  signedFreeAgentIds: string[];
  team: Team;
  onSignFreeAgent: (player: Player) => void;
};

export function FreeAgentsScreen({ signedFreeAgentIds, team, onSignFreeAgent }: FreeAgentsScreenProps) {
  const availableFreeAgents = freeAgents
    .filter((player) => !signedFreeAgentIds.includes(player.id))
    .sort((a, b) => getMarketScore(b, team) - getMarketScore(a, team));
  const bestOverall = [...availableFreeAgents].sort((a, b) => b.overall - a.overall)[0];
  const bestProspect = [...availableFreeAgents].sort((a, b) => b.potential - a.potential)[0];
  const approvedCount = availableFreeAgents.filter((player) => canSignFreeAgent(player, team).approved).length;
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
        <span className="chip">{availableFreeAgents.length} available · {approvedCount} approved</span>
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
          <span className="chip">Sorted by fit</span>
        </div>

        <div className="assistant-notes" style={{ marginBottom: '1rem' }}>
          <div className="assistant-note">
            <strong>Market sorting</strong>
            <span>Players are ranked by board approval, interest, team fit, OVR and potential upside.</span>
          </div>
        </div>

        <div className="box-score-list full-box-score-list">
          {availableFreeAgents.map((player) => (
            <FreeAgentRow key={player.id} player={player} team={team} onSignFreeAgent={onSignFreeAgent} />
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

function FreeAgentRow({ player, team, onSignFreeAgent }: { player: Player; team: Team; onSignFreeAgent: (player: Player) => void }) {
  const contract = createFreeAgentContract(player, team);
  const approval = canSignFreeAgent(player, team);
  const interest = getFreeAgentInterest(player, team);
  const fit = getFreeAgentFitLabel(player, team);

  return (
    <div className="box-score-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.age} · {player.position} · {player.archetype} · {fit}</span>
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

function getMarketScore(player: Player, team: Team) {
  const approval = canSignFreeAgent(player, team);
  const interest = getFreeAgentInterest(player, team);
  const fit = getFreeAgentFitLabel(player, team);
  const approvalScore = approval.approved ? 100 : -100;
  const interestScore = interest === 'Very Interested' ? 40 : interest === 'Interested' ? 25 : interest === 'Open' ? 10 : -40;
  const fitScore = fit === 'Fills need' ? 24 : fit === 'Ready rotation' ? 18 : fit === 'Upside punt' ? 14 : fit === 'Veteran cover' ? 8 : 4;
  const upsideScore = Math.max(0, player.potential - player.overall) * 1.5;

  return approvalScore + interestScore + fitScore + player.overall + upsideScore;
}
