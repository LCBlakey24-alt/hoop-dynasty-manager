import { canReleasePlayer, createRenewedContract, formatMoney, getContractRiskLabel, getExpiringPlayers, getPlayerContract, getReleaseSaving, getTeamAnnualWages } from '../game/contracts';
import type { Player, Team } from '../types/basketball';

type ContractsScreenProps = {
  team: Team;
  onReleasePlayer: (playerId: string) => void;
  onRenewContract: (playerId: string) => void;
};

export function ContractsScreen({ team, onReleasePlayer, onRenewContract }: ContractsScreenProps) {
  const annualWages = getTeamAnnualWages(team);
  const expiringPlayers = getExpiringPlayers(team);
  const highRiskPlayers = team.roster.filter((player) => getContractRiskLabel(player, team) === 'High risk');
  const bargainPlayers = team.roster.filter((player) => getContractRiskLabel(player, team) === 'Bargain');
  const highestPaid = [...team.roster].sort((a, b) => getPlayerContract(b, team).annualWage - getPlayerContract(a, team).annualWage)[0];
  const bestValue = [...team.roster].sort((a, b) => getValueScore(b, team) - getValueScore(a, team))[0];
  const sortedRoster = [...team.roster].sort((a, b) => getContractPriorityScore(b, team) - getContractPriorityScore(a, team));

  return (
    <section className="roster-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Contracts</p>
          <h3>{team.name} wage structure</h3>
          <p className="muted">Review squad wages, expiring deals and contract risk before future recruitment.</p>
        </div>
        <span className="chip">{formatMoney(annualWages)} annual wages</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Annual Wages" value={formatMoney(annualWages)} helper="Current squad commitment" />
        <SummaryCard label="High Risk" value={highRiskPlayers.length.toString()} helper="Key expiring contracts" />
        <SummaryCard label="Expiring Deals" value={expiringPlayers.length.toString()} helper="Players with 1 year left" />
        <SummaryCard label="Bargains" value={bargainPlayers.length.toString()} helper={bestValue ? `Best value: ${bestValue.name}` : 'No clear bargains'} />
      </section>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Contract Risk</p>
              <h3>Priority decisions</h3>
            </div>
            <span className="chip">Sorted by urgency</span>
          </div>

          <div className="assistant-notes">
            {createContractNotes(team).map((note) => (
              <div className="assistant-note" key={note.title}>
                <strong>{note.title}</strong>
                <span>{note.body}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Wage Structure</p>
              <h3>Top earners and value</h3>
            </div>
            <span className="chip">Finance view</span>
          </div>

          <div className="assistant-notes">
            <div className="assistant-note">
              <strong>Highest paid</strong>
              <span>{highestPaid.name} earns {formatMoney(getPlayerContract(highestPaid, team).annualWage)} per year.</span>
            </div>
            <div className="assistant-note">
              <strong>Best value</strong>
              <span>{bestValue.name} offers the best current balance of OVR, upside and wage.</span>
            </div>
          </div>
        </article>
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Squad Contracts</p>
            <h3>Priority wage table</h3>
          </div>
          <span className="chip">Renewals · risks · bargains</span>
        </div>

        <div className="assistant-notes" style={{ marginBottom: '1rem' }}>
          <div className="assistant-note">
            <strong>Sorting logic</strong>
            <span>Players are ordered by renewal urgency, wage risk, release value, annual wage and squad importance.</span>
          </div>
        </div>

        <div className="box-score-list full-box-score-list">
          {sortedRoster.map((player) => (
            <ContractRow onReleasePlayer={onReleasePlayer} onRenewContract={onRenewContract} player={player} team={team} key={player.id} />
          ))}
        </div>
      </article>
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

function ContractRow({ onReleasePlayer, onRenewContract, player, team }: { onReleasePlayer: (playerId: string) => void; onRenewContract: (playerId: string) => void; player: Player; team: Team }) {
  const contract = getPlayerContract(player, team);
  const renewedContract = createRenewedContract(player, team);
  const releaseApproval = canReleasePlayer(team, player.id);
  const risk = getContractRiskLabel(player, team);
  const canRenew = contract.yearsRemaining <= 1;

  return (
    <div className="box-score-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.position} · {player.role} · {player.overall} OVR · {player.potential} POT · {getContractTag(player, team)}</span>
        {canRenew && <span>Renewal offer: {formatMoney(renewedContract.annualWage)} / {renewedContract.yearsRemaining} year{renewedContract.yearsRemaining === 1 ? '' : 's'}</span>}
        <span>Release saving: {formatMoney(getReleaseSaving(player, team))} · {releaseApproval.reason}</span>
      </div>
      <StatBlock label="WAGE" value={formatMoney(contract.annualWage)} />
      <StatBlock label="YRS" value={contract.yearsRemaining.toString()} />
      <StatBlock label="RISK" value={risk} />
      {canRenew && (
        <button className="option-button active" onClick={() => onRenewContract(player.id)}>
          Renew
        </button>
      )}
      <button className="option-button" disabled={!releaseApproval.approved} onClick={() => onReleasePlayer(player.id)}>
        Release
      </button>
    </div>
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

function createContractNotes(team: Team) {
  const expiringPlayers = getExpiringPlayers(team);
  const renewalNeeded = expiringPlayers.filter((player) => getPlayerContract(player, team).status === 'Renewal Needed');
  const expensivePlayers = team.roster.filter((player) => getContractRiskLabel(player, team) === 'Expensive');
  const bargains = team.roster.filter((player) => getContractRiskLabel(player, team) === 'Bargain');
  const releasable = team.roster.filter((player) => canReleasePlayer(team, player.id).approved).sort((a, b) => getReleaseSaving(b, team) - getReleaseSaving(a, team));
  const notes = [];

  if (renewalNeeded.length > 0) {
    notes.push({
      title: 'Renewal priority',
      body: `${renewalNeeded[0].name} is entering the final year and should be reviewed before bigger clubs circle.`,
    });
  }

  if (expensivePlayers.length > 0) {
    notes.push({
      title: 'Wage efficiency concern',
      body: `${expensivePlayers[0].name} is flagged as expensive compared with squad value. Monitor performance before extending.`,
    });
  }

  if (releasable.length > 0) {
    notes.push({
      title: 'Potential wage trimming',
      body: `${releasable[0].name} could be released to save ${formatMoney(getReleaseSaving(releasable[0], team))}.`,
    });
  }

  if (bargains.length > 0) {
    notes.push({
      title: 'Value contract',
      body: `${bargains[0].name} looks like strong value. Long-term retention could protect squad value.`,
    });
  }

  if (expiringPlayers.length === 0) {
    notes.push({
      title: 'Contract stability',
      body: 'The squad has no urgent expiring deals. Recruitment planning can take priority.',
    });
  }

  return notes;
}

function getContractPriorityScore(player: Player, team: Team) {
  const contract = getPlayerContract(player, team);
  const risk = getContractRiskLabel(player, team);
  const releaseApproval = canReleasePlayer(team, player.id);
  const riskScore = risk === 'High risk' ? 120 : risk === 'Expiring' ? 90 : risk === 'Expensive' ? 65 : risk === 'Bargain' ? 45 : 20;
  const renewalScore = contract.yearsRemaining <= 1 ? 70 : 0;
  const releaseScore = releaseApproval.approved ? getReleaseSaving(player, team) / 5000 : 0;

  return riskScore + renewalScore + releaseScore + contract.annualWage / 7000 + player.overall;
}

function getContractTag(player: Player, team: Team) {
  const risk = getContractRiskLabel(player, team);
  if (risk === 'High risk') return 'Priority renewal';
  if (risk === 'Expiring') return 'Expiring deal';
  if (risk === 'Expensive') return 'Wage concern';
  if (risk === 'Bargain') return 'Value deal';
  return 'Stable deal';
}

function getValueScore(player: Player, team: Team) {
  const contract = getPlayerContract(player, team);
  const upside = Math.max(0, player.potential - player.overall);
  return player.overall * 1.5 + upside * 2 - contract.annualWage / 12000;
}
