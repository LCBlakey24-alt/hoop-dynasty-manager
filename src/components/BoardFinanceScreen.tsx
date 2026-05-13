import { formatMoney, getTeamAnnualWages } from '../game/contracts';
import type { Standing, Team } from '../types/basketball';

type BoardFinanceScreenProps = {
  boardConfidence: number;
  selectedTeam: Team;
  standings: Standing[];
  userStanding: Standing | undefined;
};

type FinanceSnapshot = {
  balance: number;
  wageBudget: number;
  currentWages: number;
  transferBudget: number;
  projectedRevenue: number;
  projectedCosts: number;
  healthLabel: string;
};

export function BoardFinanceScreen({ boardConfidence, selectedTeam, standings, userStanding }: BoardFinanceScreenProps) {
  const leaguePosition = standings.findIndex((standing) => standing.teamId === selectedTeam.id) + 1;
  const finance = createFinanceSnapshot(selectedTeam, userStanding, leaguePosition, standings.length);
  const expectations = createBoardExpectations(selectedTeam, standings.length);
  const boardNotes = createBoardNotes(boardConfidence, finance, selectedTeam, userStanding, leaguePosition, standings.length);
  const wageUsage = Math.round((finance.currentWages / finance.wageBudget) * 100);
  const projectedProfit = finance.projectedRevenue - finance.projectedCosts;

  return (
    <section className="roster-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Board & Finance</p>
          <h3>{selectedTeam.name} club office</h3>
          <p className="muted">Track board confidence, financial health, budgets and expectations.</p>
        </div>
        <span className="chip">{boardConfidence}% confidence</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Club Balance" value={formatMoney(finance.balance)} helper={finance.healthLabel} />
        <SummaryCard label="Wage Usage" value={`${wageUsage}%`} helper={`${formatMoney(finance.currentWages)} / ${formatMoney(finance.wageBudget)}`} />
        <SummaryCard label="Transfer Pot" value={formatMoney(finance.transferBudget)} helper="Early recruitment budget" />
        <SummaryCard label="Projection" value={formatMoney(projectedProfit)} helper={projectedProfit >= 0 ? 'Projected profit' : 'Projected loss'} />
      </section>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Board Expectations</p>
              <h3>Season objectives</h3>
            </div>
            <span className="chip">{selectedTeam.reputation} REP</span>
          </div>

          <div className="assistant-notes">
            {expectations.map((expectation) => (
              <div className="assistant-note" key={expectation.title}>
                <strong>{expectation.title}</strong>
                <span>{expectation.body}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Finance Breakdown</p>
              <h3>Projected season</h3>
            </div>
            <span className="chip">{finance.healthLabel}</span>
          </div>

          <div className="box-score-list full-box-score-list">
            <FinanceRow label="Projected Revenue" value={formatMoney(finance.projectedRevenue)} helper="Tickets, sponsorship and prize money estimate" />
            <FinanceRow label="Projected Costs" value={formatMoney(finance.projectedCosts)} helper="Wages, operations and academy costs estimate" />
            <FinanceRow label="Wage Budget" value={formatMoney(finance.wageBudget)} helper="Current board-approved wage ceiling" />
            <FinanceRow label="Current Contract Wages" value={formatMoney(finance.currentWages)} helper="Calculated from player contracts" />
          </div>
        </article>
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Board Notes</p>
            <h3>Recommended focus</h3>
          </div>
          <span className={boardConfidence < 55 ? 'chip warning' : 'chip'}>{boardConfidence < 55 ? 'Pressure' : 'Stable'}</span>
        </div>

        <div className="box-score-list full-box-score-list">
          {boardNotes.map((note) => (
            <div className="box-score-row" key={note.title}>
              <div>
                <strong>{note.title}</strong>
                <span>{note.body}</span>
              </div>
              <StatBlock label="AREA" value={note.area} />
              <StatBlock label="PRIO" value={note.priority} />
            </div>
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

function FinanceRow({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="box-score-row">
      <div>
        <strong>{label}</strong>
        <span>{helper}</span>
      </div>
      <StatBlock label="VALUE" value={value} />
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

function createFinanceSnapshot(team: Team, standing: Standing | undefined, leaguePosition: number, totalTeams: number): FinanceSnapshot {
  const reputationFactor = team.reputation / 100;
  const titleBonus = Math.min(team.championships, 8) * 35000;
  const tableBonus = leaguePosition > 0 ? Math.max(0, totalTeams - leaguePosition + 1) * 18000 : 0;
  const balance = Math.round(650000 + team.reputation * 12500 + titleBonus);
  const wageBudget = Math.round(240000 + team.reputation * 3900);
  const currentWages = getTeamAnnualWages(team);
  const transferBudget = Math.round(Math.max(60000, balance * 0.16 + (standing?.wins ?? 0) * 4500));
  const projectedRevenue = Math.round(420000 + reputationFactor * 720000 + tableBonus + titleBonus);
  const projectedCosts = Math.round(currentWages + 320000 + team.roster.length * 12500);
  const projectedProfit = projectedRevenue - projectedCosts;
  const healthLabel = projectedProfit >= 120000
    ? 'Healthy'
    : projectedProfit >= 0
      ? 'Stable'
      : projectedProfit >= -100000
        ? 'Tight'
        : 'At risk';

  return { balance, wageBudget, currentWages, transferBudget, projectedRevenue, projectedCosts, healthLabel };
}

function createBoardExpectations(team: Team, totalTeams: number) {
  const expectedFinish = team.reputation >= 78
    ? 'Challenge for the title'
    : team.reputation >= 70
      ? 'Reach the playoffs'
      : team.reputation >= 64
        ? 'Compete for the top half'
        : 'Build toward future contention';
  const expectedRank = team.reputation >= 78 ? 3 : team.reputation >= 70 ? 8 : Math.ceil(totalTeams / 2);

  return [
    {
      title: 'League target',
      body: `${expectedFinish}. Board benchmark: finish around ${getOrdinalPosition(expectedRank)} or better.`,
    },
    {
      title: 'Squad management',
      body: team.reputation >= 72 ? 'Keep senior players productive while avoiding wage waste.' : 'Prioritise development minutes and protect future value.',
    },
    {
      title: 'Financial discipline',
      body: 'Stay within wage budget and avoid sacrificing long-term stability for short-term results.',
    },
  ];
}

function createBoardNotes(
  boardConfidence: number,
  finance: FinanceSnapshot,
  team: Team,
  standing: Standing | undefined,
  leaguePosition: number,
  totalTeams: number,
) {
  const notes = [];
  const wageUsage = Math.round((finance.currentWages / finance.wageBudget) * 100);
  const projectedProfit = finance.projectedRevenue - finance.projectedCosts;

  if (boardConfidence < 55) {
    notes.push({ title: 'Board pressure rising', body: 'Results and performances need improvement soon. Prioritise short-term stability.', area: 'Board', priority: 'High' });
  } else {
    notes.push({ title: 'Board confidence stable', body: `The board currently rates your work at ${boardConfidence}%. Keep aligning results with expectations.`, area: 'Board', priority: 'Normal' });
  }

  if (wageUsage >= 95) {
    notes.push({ title: 'Wage budget almost maxed', body: 'Future recruitment could be restricted unless wages are reduced or revenue improves.', area: 'Wages', priority: 'High' });
  } else if (wageUsage <= 75) {
    notes.push({ title: 'Wage space available', body: 'There is room to improve the squad without breaking the current wage structure.', area: 'Wages', priority: 'Normal' });
  }

  if (projectedProfit < 0) {
    notes.push({ title: 'Projected loss warning', body: 'Current projections show a loss. Playoff progress or wage control may be needed.', area: 'Finance', priority: 'High' });
  } else {
    notes.push({ title: 'Financial projection acceptable', body: 'Projected revenue currently covers expected costs for the season.', area: 'Finance', priority: 'Low' });
  }

  if (standing && leaguePosition > Math.ceil(totalTeams / 2) && team.reputation >= 70) {
    notes.push({ title: 'League position below expectation', body: `${team.name} are ${getOrdinalPosition(leaguePosition)} despite a strong reputation. The board may expect a climb.`, area: 'Results', priority: 'High' });
  }

  return notes;
}

function getOrdinalPosition(position: number) {
  if (position <= 0) return '—';

  const suffix = position % 10 === 1 && position !== 11
    ? 'st'
    : position % 10 === 2 && position !== 12
      ? 'nd'
      : position % 10 === 3 && position !== 13
        ? 'rd'
        : 'th';

  return `${position}${suffix}`;
}
