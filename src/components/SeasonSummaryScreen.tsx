import { getChampion } from '../game/playoffs';
import type { SimulatedGameResult } from '../game/simulateGame';
import type { Standing } from '../types/basketball';

type SeasonSummaryScreenProps = {
  gamesPlayed: number;
  playoffResults: SimulatedGameResult[];
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
};

export function SeasonSummaryScreen({ gamesPlayed, playoffResults, standings, totalGames, userTeamId }: SeasonSummaryScreenProps) {
  const champion = getChampion(standings, playoffResults);
  const regularSeasonComplete = gamesPlayed >= totalGames;
  const userStanding = standings.find((standing) => standing.teamId === userTeamId);
  const userPosition = userStanding ? standings.findIndex((standing) => standing.teamId === userTeamId) + 1 : null;
  const topFour = standings.slice(0, 4);

  if (!champion) {
    return (
      <section className="season-summary-screen">
        <div className="screen-heading">
          <div>
            <p className="eyebrow">Season Summary</p>
            <h3>Season not complete</h3>
            <p className="muted">Finish the regular season and crown a playoff champion to unlock the full season summary.</p>
          </div>
          <span className="chip">{regularSeasonComplete ? 'Playoffs pending' : `${gamesPlayed}/${totalGames} games`}</span>
        </div>

        <section className="season-summary-grid">
          <SummaryCard label="Regular Season" value={regularSeasonComplete ? 'Complete' : 'In Progress'} helper={`${gamesPlayed}/${totalGames} games played`} />
          <SummaryCard label="Playoff Games" value={playoffResults.length.toString()} helper="Postseason games played" />
          <SummaryCard label="Champion" value="TBD" helper="Final winner required" />
          <SummaryCard label="Your Finish" value={userPosition ? ordinal(userPosition) : '—'} helper={userStanding ? `${userStanding.wins}-${userStanding.losses}` : 'No games played'} />
        </section>
      </section>
    );
  }

  return (
    <section className="season-summary-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Season Summary</p>
          <h3>{champion.standing.teamName} win the BSBL</h3>
          <p className="muted">The first complete season loop is finished: regular season, playoffs and champion.</p>
        </div>
        <span className="chip">Season Complete</span>
      </div>

      <article className="panel champion-panel season-champion-panel">
        <p className="eyebrow">BSBL Champion</p>
        <h3>{champion.standing.teamName}</h3>
        <p className="muted">Seed {champion.seed} completed the postseason and lifted the title.</p>
      </article>

      <section className="season-summary-grid">
        <SummaryCard label="Your Record" value={userStanding ? `${userStanding.wins}-${userStanding.losses}` : '—'} helper={userPosition ? `${ordinal(userPosition)} in regular season` : 'No finish recorded'} />
        <SummaryCard label="Champion Seed" value={champion.seed.toString()} helper={champion.standing.shortName} />
        <SummaryCard label="Regular Season" value="132" helper="Games completed" />
        <SummaryCard label="Playoff Games" value={playoffResults.length.toString()} helper="Postseason games completed" />
      </section>

      <section className="season-summary-panels">
        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Regular Season</p>
              <h3>Top four</h3>
            </div>
            <span className="chip">Final Table</span>
          </div>
          <div className="league-mini-list">
            {topFour.map((standing, index) => (
              <div className={standing.teamId === userTeamId ? 'league-mini-row user-team' : 'league-mini-row'} key={standing.teamId}>
                <span>{index + 1}</span>
                <span className="team-dot" style={{ background: standing.primaryColor }} />
                <strong>{standing.shortName}</strong>
                <em>{standing.wins}-{standing.losses}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Postseason</p>
              <h3>Playoff results</h3>
            </div>
            <span className="chip">{playoffResults.length} games</span>
          </div>
          <div className="season-result-list">
            {playoffResults.map((result) => (
              <div className="season-result-row" key={`${result.homeTeamId}-${result.awayTeamId}`}>
                <strong>{result.homeScore} - {result.awayScore}</strong>
                <span>{result.summary}</span>
              </div>
            ))}
          </div>
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
    <article className="panel season-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
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
