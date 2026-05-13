import { createRenewedContract, formatMoney, getContractRiskLabel, getExpiringPlayers, getPlayerContract, getTeamAnnualWages } from '../game/contracts';
import type { Player, Team } from '../types/basketball';

type ContractsScreenProps = {
  team: Team;
  onRenewContract: (playerId: string) => void;
};

export function ContractsScreen({ team, onRenewContract }: ContractsScreenProps) {
  const annualWages = getTeamAnnualWages(team);
  const expiringPlayers = getExpiringPlayers(team);
  const highestPaid = [...team.roster].sort((a, b) => getPlayerContract(b, team).annualWage - getPlayerContract(a, team).annualWage)[0];
  const bestValue = [...team.roster].sort((a, b) => getValueScore(b, team) - getValueScore(a, team))[0];
  const sortedRoster = [...team.roster].sort((a, b) => getPlayerContract(b, team).annualWage - getPlayerContract(a, team).annualWage);

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
        <SummaryCard label="Expiring Deals" value={expiringPlayers.length.toString()} helper="Players with 1 year left" />
        <SummaryCard label="Highest Paid" value={highestPaid.name} helper={`${formatMoney(getPlayerContract(highestPaid, team).annualWage)} / year`} />
        <SummaryCard label="Best Value" value={bestValue.name} helper={`${bestValue.overall} OVR · ${formatMoney(getPlayerContract(bestValue, team).annualWage)}`} />
      </section>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Contract Risk</p>
              <h3>Priority decisions</h3>
            </div>
            <span className="chip">Staff view</span>
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
              <p className="eyebrow">Expiring Deals</p>
              <h3>Renewal watch</h3>
            </div>
            <span className="chip">{expiringPlayers.length} players</span>
          </div>

          <div className="box-score-list full-box-score-list">
            {expiringPlayers.length > 0 ? expiringPlayers.map((player) => (
              <ContractRow compact onRenewContract={onRenewContract} player={player} team={team} key={player.id} />
            )) : (
              <div className="box-score-row">
                <div>
                  <strong>No urgent renewals</strong>
                  <span>There are no players with contracts expiring within one year.</span>
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Squad Contracts</p>
            <h3>Full wage table</h3>
          </div>
          <span className="chip">{team.roster.length} contracts</span>
        </div>

        <div className="box-score-list full-box-score-list">
          {sortedRoster.map((player) => (
            <ContractRow onRenewContract={onRenewContract} player={player} team={team} key={player.id} />
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

function ContractRow({ compact = false, onRenewContract, player, team }: { compact?: boolean; onRenewContract: (playerId: string) => void; player: Player; team: Team }) {
  const contract = getPlayerContract(player, team);
  const renewedContract = createRenewedContract(player, team);
  const risk = getContractRiskLabel(player, team);
  const canRenew = contract.yearsRemaining <= 1;

  return (
    <div className="box-score-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.position} · {player.role} · {player.overall} OVR · {player.potential} POT</span>
        {canRenew && <span>Renewal offer: {formatMoney(renewedContract.annualWage)} / {renewedContract.yearsRemaining} year{renewedContract.yearsRemaining === 1 ? '' : 's'}</span>}
      </div>
      <StatBlock label="WAGE" value={formatMoney(contract.annualWage)} />
      <StatBlock label="YRS" value={contract.yearsRemaining.toString()} />
      <StatBlock label={compact ? 'STATUS' : 'RISK'} value={compact ? contract.status : risk} />
      {canRenew && (
        <button className="option-button active" onClick={() => onRenewContract(player.id)}>
          Renew
        </button>
      )}
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

function getValueScore(player: Player, team: Team) {
  const contract = getPlayerContract(player, team);
  const upside = Math.max(0, player.potential - player.overall);
  return player.overall * 1.5 + upside * 2 - contract.annualWage / 12000;
}
