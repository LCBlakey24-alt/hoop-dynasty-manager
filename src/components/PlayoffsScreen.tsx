import { createQuarterFinalMatchups, getPlayoffSeeds } from '../game/playoffs';
import type { SimulatedGameResult } from '../game/simulateGame';
import type { Standing } from '../types/basketball';

type PlayoffsScreenProps = {
  gamesPlayed: number;
  onSimulateQuarterFinals: () => void;
  playoffResults: SimulatedGameResult[];
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
};

export function PlayoffsScreen({ gamesPlayed, onSimulateQuarterFinals, playoffResults, standings, totalGames, userTeamId }: PlayoffsScreenProps) {
  const regularSeasonComplete = gamesPlayed >= totalGames;
  const playoffSeeds = getPlayoffSeeds(standings);
  const quarterFinals = createQuarterFinalMatchups(standings);
  const userQualified = playoffSeeds.some((seed) => seed.standing.teamId === userTeamId);
  const quarterFinalsComplete = playoffResults.length >= quarterFinals.length;

  if (!regularSeasonComplete) {
    return (
      <section className="playoffs-screen">
        <div className="screen-heading">
          <div>
            <p className="eyebrow">BSBL Playoffs</p>
            <h3>Playoff race locked</h3>
            <p className="muted">Finish the regular season before the postseason bracket is generated.</p>
          </div>
          <span className="chip">{gamesPlayed}/{totalGames} games played</span>
        </div>

        <section className="playoff-summary-grid">
          <SummaryCard label="Games Remaining" value={(totalGames - gamesPlayed).toString()} helper="Regular season fixtures left" />
          <SummaryCard label="Playoff Places" value="Top 8" helper="Qualify for postseason" />
          <SummaryCard label="Current Cut" value={standings[7]?.shortName ?? '—'} helper="8th seed right now" />
          <SummaryCard label="Your Status" value={userQualified ? 'In' : 'Out'} helper="Based on current table" />
        </section>

        <article className="panel playoff-panel">
          <p className="eyebrow">Current Top 8</p>
          <h3>Projected qualifiers</h3>
          <SeedList seeds={playoffSeeds} userTeamId={userTeamId} />
        </article>
      </section>
    );
  }

  return (
    <section className="playoffs-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">BSBL Playoffs</p>
          <h3>Quarter-final bracket</h3>
          <p className="muted">The top 8 regular season teams have qualified. Simulate the quarter-finals to advance four teams.</p>
        </div>
        <span className="chip">Regular season complete</span>
      </div>

      <section className="playoff-summary-grid">
        <SummaryCard label="Qualified" value="8" helper="Teams in playoff bracket" />
        <SummaryCard label="Format" value="1v8" helper="Seeded knockout bracket" />
        <SummaryCard label="Your Status" value={userQualified ? 'Qualified' : 'Eliminated'} helper="Based on final table" />
        <SummaryCard label="QF Status" value={quarterFinalsComplete ? 'Complete' : 'Pending'} helper={`${playoffResults.length}/${quarterFinals.length} played`} />
      </section>

      {!quarterFinalsComplete && (
        <button className="primary-action playoff-action" onClick={onSimulateQuarterFinals}>Simulate Quarter-Finals</button>
      )}

      <section className="playoff-grid">
        {quarterFinals.map((matchup) => {
          const result = playoffResults.find((candidate) => candidate.homeTeamId === matchup.homeSeed.standing.teamId && candidate.awayTeamId === matchup.awaySeed.standing.teamId);
          const winnerId = result?.winnerTeamId;

          return (
            <article className="panel playoff-matchup" key={matchup.id}>
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{matchup.round}</p>
                  <h3>Seed {matchup.homeSeed.seed} vs Seed {matchup.awaySeed.seed}</h3>
                </div>
                <span className="chip">{result ? 'Final' : 'Pending'}</span>
              </div>
              <SeedTeam resultScore={result?.homeScore} seed={matchup.homeSeed} userTeamId={userTeamId} winnerId={winnerId} />
              <div className="playoff-versus">VS</div>
              <SeedTeam resultScore={result?.awayScore} seed={matchup.awaySeed} userTeamId={userTeamId} winnerId={winnerId} />
            </article>
          );
        })}
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
    <article className="panel playoff-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

type SeedListProps = {
  seeds: ReturnType<typeof getPlayoffSeeds>;
  userTeamId: string;
};

function SeedList({ seeds, userTeamId }: SeedListProps) {
  return (
    <div className="seed-list">
      {seeds.map((seed) => (
        <SeedTeam seed={seed} userTeamId={userTeamId} key={seed.standing.teamId} />
      ))}
    </div>
  );
}

type SeedTeamProps = {
  resultScore?: number;
  seed: ReturnType<typeof getPlayoffSeeds>[number];
  userTeamId: string;
  winnerId?: string;
};

function SeedTeam({ resultScore, seed, userTeamId, winnerId }: SeedTeamProps) {
  const isUserTeam = seed.standing.teamId === userTeamId;
  const isWinner = winnerId === seed.standing.teamId;

  return (
    <div className={isUserTeam ? 'seed-team user-team' : isWinner ? 'seed-team winner' : 'seed-team'}>
      <span className="standings-rank">{seed.seed}</span>
      <span className="team-dot" style={{ background: seed.standing.primaryColor }} />
      <div>
        <strong>{seed.standing.teamName}</strong>
        <span>{seed.standing.wins}-{seed.standing.losses} · {seed.standing.pointDifference > 0 ? `+${seed.standing.pointDifference}` : seed.standing.pointDifference}</span>
      </div>
      {typeof resultScore === 'number' && <em>{resultScore}</em>}
    </div>
  );
}
