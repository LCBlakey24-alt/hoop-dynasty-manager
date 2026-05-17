import { getChampion } from '../game/playoffs';
import type { SimulatedGameResult } from '../game/simulateGame';
import type { Standing, Team } from '../types/basketball';

type SeasonSummaryScreenProps = {
  gamesPlayed: number;
  playoffResults: SimulatedGameResult[];
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
  teams: Team[];
};

export function SeasonSummaryScreen({ gamesPlayed, playoffResults, standings, totalGames, userTeamId, teams }: SeasonSummaryScreenProps) {
  const champion = getChampion(standings, playoffResults);
  const regularSeasonComplete = gamesPlayed >= totalGames;
  const userStanding = standings.find((standing) => standing.teamId === userTeamId);
  const userPosition = userStanding ? standings.findIndex((standing) => standing.teamId === userTeamId) + 1 : null;
  const topFour = standings.slice(0, 4);
  const playoffCut = standings.slice(0, 8);
  const userTeam = teams.find((team) => team.id === userTeamId);
  const championTeam = teams.find((team) => team.id === champion?.standing.teamId);
  const seasonVerdict = getSeasonVerdict(Boolean(champion), Boolean(userStanding && userPosition && userPosition <= 8), champion?.standing.teamId === userTeamId, regularSeasonComplete);
  const awards = getSeasonAwards(teams, champion?.standing.teamId);

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

        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Next Steps</p>
              <h3>Completion checklist</h3>
            </div>
            <span className="chip">Locked</span>
          </div>
          <div className="assistant-notes">
            <SeasonNote title="Regular season" body={regularSeasonComplete ? 'Complete. Playoffs are ready or underway.' : `${totalGames - gamesPlayed} regular-season games remain.`} />
            <SeasonNote title="Playoffs" body={playoffResults.length ? `${playoffResults.length} playoff games have been played.` : 'No playoff games played yet.'} />
            <SeasonNote title="Full summary" body="Crown a champion to unlock the final season verdict and legacy recap." />
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="season-summary-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Season Summary</p>
          <h3>{champion.standing.teamName} win the BSBL</h3>
          <p className="muted">The season loop is complete: regular season, playoffs and champion.</p>
        </div>
        <span className="chip">{seasonVerdict}</span>
      </div>

      <article className="panel champion-panel season-champion-panel">
        <p className="eyebrow">BSBL Champion</p>
        <h3>{champion.standing.teamName}</h3>
        <p className="muted">Seed {champion.seed} completed the postseason and lifted the title.</p>
      </article>

      <section className="season-summary-grid">
        <SummaryCard label="Season Verdict" value={seasonVerdict} helper={getSeasonVerdictHelper(seasonVerdict)} />
        <SummaryCard label="Your Record" value={userStanding ? `${userStanding.wins}-${userStanding.losses}` : '—'} helper={userPosition ? `${ordinal(userPosition)} in regular season` : 'No finish recorded'} />
        <SummaryCard label="Champion Seed" value={champion.seed.toString()} helper={champion.standing.shortName} />
        <SummaryCard label="Playoff Games" value={playoffResults.length.toString()} helper="Postseason games completed" />
      </section>

      <section className="season-summary-panels">
        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Season Awards</p>
              <h3>League honours</h3>
            </div>
            <span className="chip">Immersion</span>
          </div>
          <div className="assistant-notes">
            <SeasonNote title="MVP" body={`${awards.mvp.player} (${awards.mvp.team}) · OVR ${awards.mvp.overall}`} />
            <SeasonNote title="Defensive Player" body={`${awards.dpoy.player} (${awards.dpoy.team}) · Morale ${awards.dpoy.morale}`} />
            <SeasonNote title="Most Improved" body={`${awards.mip.player} (${awards.mip.team}) · POT ${awards.mip.potential}`} />
            <SeasonNote title="Champion Coach" body={awards.championCoach} />
          </div>
        </article>

        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Campaign Review</p>
              <h3>Season story</h3>
            </div>
            <span className="chip">Narrative</span>
          </div>
          <div className="assistant-notes">
            <SeasonNote title="Champion" body={`${champion.standing.teamName} ended the year as BSBL champions from seed ${champion.seed}.`} />
            <SeasonNote title="Your club" body={userStanding && userPosition ? `${userTeam?.name ?? 'Your team'} finished ${ordinal(userPosition)} with a ${userStanding.wins}-${userStanding.losses} record and ${userStanding.pointDifference >= 0 ? '+' : ''}${userStanding.pointDifference} point difference.` : 'Your club did not record a final table position.'} />
            <SeasonNote title="Offseason focus" body={getOffseasonAdvice(seasonVerdict)} />
          </div>
        </article>

        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Franchise Legacy</p>
              <h3>Historical context</h3>
            </div>
            <span className="chip">Legacy</span>
          </div>
          <div className="assistant-notes">
            <SeasonNote title={userTeam?.name ?? 'Your team'} body={userTeam ? `${userTeam.championships} historical titles since ${userTeam.foundedYear}.` : 'Legacy unavailable.'} />
            <SeasonNote title="Champion context" body={championTeam ? `${championTeam.shortName} now stand on ${championTeam.championships} all-time titles in the historical record.` : 'Champion data unavailable.'} />
            <SeasonNote title="Club icons" body={userTeam ? userTeam.historicPlayers.join(' · ') : 'Build your own legacy.'} />
          </div>
        </article>
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
          <MiniStandingList standings={topFour} userTeamId={userTeamId} />
        </article>

        <article className="panel season-summary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Playoff Field</p>
              <h3>Top eight</h3>
            </div>
            <span className="chip">Qualified</span>
          </div>
          <MiniStandingList standings={playoffCut} userTeamId={userTeamId} showPointDifference />
        </article>
      </section>

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
  );
}

function getSeasonAwards(teams: Team[], championTeamId?: string) {
  const rosterRows = teams.flatMap((team) => team.roster.map((player) => ({ team: team.shortName, player })));
  const mvp = [...rosterRows].sort((a, b) => b.player.overall - a.player.overall)[0];
  const dpoy = [...rosterRows].sort((a, b) => b.player.morale - a.player.morale || b.player.form - a.player.form)[0];
  const mip = [...rosterRows].sort((a, b) => b.player.potential - a.player.potential || (b.player.developmentProgress ?? 0) - (a.player.developmentProgress ?? 0))[0];
  const championCoachTeam = teams.find((team) => team.id === championTeamId);

  return {
    mvp: { player: mvp.player.name, team: mvp.team, overall: mvp.player.overall },
    dpoy: { player: dpoy.player.name, team: dpoy.team, morale: dpoy.player.morale },
    mip: { player: mip.player.name, team: mip.team, potential: mip.player.potential },
    championCoach: championCoachTeam ? `${championCoachTeam.name} staff win Coach of the Year momentum award.` : 'Champion pending.',
  };
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

function SeasonNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function MiniStandingList({ showPointDifference = false, standings, userTeamId }: { showPointDifference?: boolean; standings: Standing[]; userTeamId: string }) {
  return (
    <div className="league-mini-list">
      {standings.map((standing, index) => (
        <div className={standing.teamId === userTeamId ? 'league-mini-row user-team' : 'league-mini-row'} key={standing.teamId}>
          <span>{index + 1}</span>
          <span className="team-dot" style={{ background: standing.primaryColor }} />
          <strong>{standing.shortName}</strong>
          <em>{showPointDifference ? `${standing.pointDifference >= 0 ? '+' : ''}${standing.pointDifference}` : `${standing.wins}-${standing.losses}`}</em>
        </div>
      ))}
    </div>
  );
}

function getSeasonVerdict(hasChampion: boolean, userMadePlayoffs: boolean, userWonTitle: boolean, regularSeasonComplete: boolean) {
  if (!regularSeasonComplete) return 'In Progress';
  if (!hasChampion) return 'Playoffs Pending';
  if (userWonTitle) return 'Champions';
  if (userMadePlayoffs) return 'Playoff Team';
  return 'Missed Playoffs';
}

function getSeasonVerdictHelper(verdict: string) {
  if (verdict === 'Champions') return 'Title-winning season';
  if (verdict === 'Playoff Team') return 'Postseason reached';
  if (verdict === 'Missed Playoffs') return 'Rebuild focus needed';
  if (verdict === 'Playoffs Pending') return 'Champion still needed';
  return 'Season still unfolding';
}

function getOffseasonAdvice(verdict: string) {
  if (verdict === 'Champions') return 'Keep the core together, renew key contracts and avoid complacency.';
  if (verdict === 'Playoff Team') return 'Identify the gap to title contenders and add one reliable rotation upgrade.';
  if (verdict === 'Missed Playoffs') return 'Prioritise development, wage flexibility and a clearer tactical identity.';
  return 'Complete the season before setting offseason priorities.';
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
