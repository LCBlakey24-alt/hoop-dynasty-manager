import type { Standing } from '../types/basketball';

type LeagueScreenProps = {
  gamesPlayed: number;
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
};

export function LeagueScreen({ gamesPlayed, standings, totalGames, userTeamId }: LeagueScreenProps) {
  const userStanding = standings.find((standing) => standing.teamId === userTeamId);
  const playoffTeams = standings.slice(0, 8);
  const chasingTeams = standings.slice(8);

  return (
    <section className="league-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">League Table</p>
          <h3>BSBL standings</h3>
          <p className="muted">Track the full table, playoff race, point difference and regular season progress.</p>
        </div>
        <span className="chip">{gamesPlayed}/{totalGames} games played</span>
      </div>

      <section className="league-summary-grid">
        <SummaryCard label="Your Position" value={userStanding ? ordinal(standings.indexOf(userStanding) + 1) : '—'} helper="Current table rank" />
        <SummaryCard label="Your Record" value={userStanding ? `${userStanding.wins}-${userStanding.losses}` : '0-0'} helper="Wins and losses" />
        <SummaryCard label="Playoff Places" value="Top 8" helper="Qualify for postseason" />
        <SummaryCard label="Games Played" value={`${gamesPlayed}`} helper={`${totalGames - gamesPlayed} remaining`} />
      </section>

      <article className="panel league-table-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Regular Season</p>
            <h3>Full table</h3>
          </div>
          <span className="chip">Point difference tiebreaker</span>
        </div>

        <div className="full-standings-table">
          <div className="standings-table-row standings-table-header">
            <span>Pos</span>
            <span>Team</span>
            <span>P</span>
            <span>W</span>
            <span>L</span>
            <span>Win%</span>
            <span>PF</span>
            <span>PA</span>
            <span>+/-</span>
          </div>

          {standings.map((standing, index) => (
            <div className={standing.teamId === userTeamId ? 'standings-table-row user-team' : 'standings-table-row'} key={standing.teamId}>
              <span className="standings-rank">{index + 1}</span>
              <div className="standings-team-cell">
                <span className="team-dot" style={{ background: standing.primaryColor }} />
                <div>
                  <strong>{standing.teamName}</strong>
                  <span>{standing.nation}</span>
                </div>
              </div>
              <span>{standing.played}</span>
              <span>{standing.wins}</span>
              <span>{standing.losses}</span>
              <span>{formatPercentage(standing.winPercentage)}</span>
              <span>{standing.pointsFor}</span>
              <span>{standing.pointsAgainst}</span>
              <strong>{standing.pointDifference > 0 ? `+${standing.pointDifference}` : standing.pointDifference}</strong>
            </div>
          ))}
        </div>
      </article>

      <section className="league-summary-panels">
        <article className="panel league-mini-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Playoff Zone</p>
              <h3>Top 8</h3>
            </div>
            <span className="chip">In</span>
          </div>
          <MiniTeamList standings={playoffTeams} />
        </article>

        <article className="panel league-mini-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Chasing Pack</p>
              <h3>Outside looking in</h3>
            </div>
            <span className="chip">Out</span>
          </div>
          <MiniTeamList standings={chasingTeams} />
        </article>
      </section>
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
    <article className="panel league-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

type MiniTeamListProps = {
  standings: Standing[];
};

function MiniTeamList({ standings }: MiniTeamListProps) {
  return (
    <div className="league-mini-list">
      {standings.map((standing, index) => (
        <div className="league-mini-row" key={standing.teamId}>
          <span>{index + 1}</span>
          <span className="team-dot" style={{ background: standing.primaryColor }} />
          <strong>{standing.shortName}</strong>
          <em>{standing.wins}-{standing.losses}</em>
        </div>
      ))}
    </div>
  );
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) return '.000';

  return value.toFixed(3).replace('0.', '.');
}

function ordinal(position: number) {
  const suffix = position % 10 === 1 && position !== 11
    ? 'st'
    : position % 10 === 2 && position !== 12
      ? 'nd'
      : position % 10 === 3 && position !== 13
        ? 'rd'
        : 'th';

  return `${position}${suffix}`;
}
