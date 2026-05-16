import { TeamLogo } from './TeamLogo';
import type { Standing } from '../types/basketball';

type LeagueScreenProps = {
  focusMode: 'My Team' | 'League';
  gamesPlayed: number;
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
};

export function LeagueScreen({ focusMode, gamesPlayed, standings, totalGames, userTeamId }: LeagueScreenProps) {
  const userStanding = standings.find((standing) => standing.teamId === userTeamId);
  const userRank = userStanding ? standings.indexOf(userStanding) + 1 : 0;
  const playoffTeams = standings.slice(0, 8);
  const chasingTeams = standings.slice(8);
  const leader = standings[0];
  const playoffCutline = standings[7];
  const firstOut = standings[8];
  const bestPointDifference = [...standings].sort((a, b) => b.pointDifference - a.pointDifference)[0];
  const bestOffence = [...standings].sort((a, b) => b.pointsFor - a.pointsFor)[0];
  const bestDefence = [...standings].sort((a, b) => a.pointsAgainst - b.pointsAgainst)[0];

  return (
    <section className={focusMode === 'My Team' ? 'league-screen compact-league-screen' : 'league-screen'}>
      <div className="screen-heading">
        <div>
          <p className="eyebrow">League Table</p>
          <h3>BSBL standings</h3>
          <p className="muted">Track the full table, playoff race, point difference and regular season progress.</p>
        </div>
        <span className="chip">{gamesPlayed}/{totalGames} games played</span>
      </div>

      <section className="league-summary-grid">
        <SummaryCard label="Your Position" value={userStanding ? ordinal(userRank) : '—'} helper={userStanding ? getTableStatus(userRank, standings.length) : 'Current table rank'} />
        <SummaryCard label="League Leader" value={leader?.shortName ?? '—'} helper={leader ? `${leader.wins}-${leader.losses} · ${formatPercentage(leader.winPercentage)}` : 'Awaiting results'} />
        <SummaryCard label="Playoff Cutline" value={playoffCutline?.shortName ?? '—'} helper={firstOut ? `${firstOut.shortName} chasing from 9th` : 'Top 8 qualify'} />
        <SummaryCard label="Games Remaining" value={`${totalGames - gamesPlayed}`} helper="Before playoff seeding locks" />
      </section>

      {focusMode === 'League' && <>
        <section className="league-summary-panels">
        <article className="panel league-mini-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Table Intelligence</p>
              <h3>Race notes</h3>
            </div>
            <span className="chip">Scout view</span>
          </div>
          <div className="assistant-notes">
            <LeagueNote title="Title race" body={leader ? `${leader.teamName} currently set the pace at ${leader.wins}-${leader.losses}.` : 'The title race will form after fixtures are played.'} />
            <LeagueNote title="Playoff bubble" body={playoffCutline && firstOut ? `${playoffCutline.teamName} hold 8th while ${firstOut.teamName} chase from 9th.` : 'The playoff bubble is not active yet.'} />
            <LeagueNote title="Your situation" body={userStanding ? `${userStanding.teamName} are ${ordinal(userRank)} with ${userStanding.pointDifference >= 0 ? '+' : ''}${userStanding.pointDifference} point difference.` : 'Choose a team to track your league status.'} />
          </div>
        </article>

        <article className="panel league-mini-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">League Leaders</p>
              <h3>Stat profile</h3>
            </div>
            <span className="chip">Team form</span>
          </div>
          <div className="assistant-notes">
            <LeagueNote title="Best offence" body={bestOffence ? `${bestOffence.teamName} lead scoring with ${bestOffence.pointsFor} points.` : 'Awaiting games.'} />
            <LeagueNote title="Best defence" body={bestDefence ? `${bestDefence.teamName} have allowed ${bestDefence.pointsAgainst} points.` : 'Awaiting games.'} />
            <LeagueNote title="Best differential" body={bestPointDifference ? `${bestPointDifference.teamName} sit at ${bestPointDifference.pointDifference >= 0 ? '+' : ''}${bestPointDifference.pointDifference}.` : 'Awaiting games.'} />
          </div>
        </article>
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

          {standings.map((standing, index) => {
            const rank = index + 1;
            return (
              <div className={standing.teamId === userTeamId ? 'standings-table-row user-team' : 'standings-table-row'} key={standing.teamId}>
                <span className="standings-rank">{rank}</span>
                <div className="standings-team-cell">
                  <TeamLogo teamId={standing.teamId} teamName={standing.teamName} size={34} className="team-table-logo" />
                  <div>
                    <strong>{standing.teamName}</strong>
                    <span>{standing.nation} · {getTableStatus(rank, standings.length)}</span>
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
            );
          })}
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
          <MiniTeamList standings={chasingTeams} startRank={9} />
        </article>
        </section>
      </>}
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
  startRank?: number;
};

function MiniTeamList({ standings, startRank = 1 }: MiniTeamListProps) {
  return (
    <div className="league-mini-list">
      {standings.map((standing, index) => (
        <div className="league-mini-row" key={standing.teamId}>
          <span>{startRank + index}</span>
          <TeamLogo teamId={standing.teamId} teamName={standing.teamName} size={26} className="team-mini-logo" />
          <strong>{standing.shortName}</strong>
          <em>{standing.wins}-{standing.losses}</em>
        </div>
      ))}
    </div>
  );
}

function LeagueNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function getTableStatus(rank: number, totalTeams: number) {
  if (rank <= 3) return 'Contender';
  if (rank <= 8) return 'Playoff zone';
  if (rank <= Math.ceil(totalTeams * 0.75)) return 'Chasing pack';
  return 'Struggling';
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
