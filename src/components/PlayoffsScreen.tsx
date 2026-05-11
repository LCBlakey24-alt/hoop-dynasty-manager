import { createQuarterFinalMatchups, getPlayoffSeeds } from '../game/playoffs';
import type { Standing } from '../types/basketball';

type PlayoffsScreenProps = {
  gamesPlayed: number;
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
};

export function PlayoffsScreen({ gamesPlayed, standings, totalGames, userTeamId }: PlayoffsScreenProps) {
  const regularSeasonComplete = gamesPlayed >= totalGames;
  const playoffSeeds = getPlayoffSeeds(standings);
  const quarterFinals = createQuarterFinalMatchups(standings);
  const userQualified = playoffSeeds.some((seed) => seed.standing.teamId === userTeamId);

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
          <p className="muted">The top 8 regular season teams have qualified. Single-game playoff simulation comes next.</p>
        </div>
        <span className="chip">Regular season complete</span>
      </div>

      <section className="playoff-summary-grid">
        <SummaryCard label="Qualified" value="8" helper="Teams in playoff bracket" />
        <SummaryCard label="Format" value="1v8" helper="Seeded knockout bracket" />
        <SummaryCard label="Your Status" value={userQualified ? 'Qualified' : 'Eliminated'} helper="Based on final table" />
        <SummaryCard label="Champion" value="TBD" helper="Playoff simulation pending" />
      </section>

      <section className="playoff-grid">
        {quarterFinals.map((matchup) => (
          <article className="panel playoff-matchup" key={matchup.id}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">{matchup.round}</p>
                <h3>Seed {matchup.homeSeed.seed} vs Seed {matchup.awaySeed.seed}</h3>
              </div>
              <span className="chip">Pending</span>
            </div>
            <SeedTeam seed={matchup.homeSeed} userTeamId={userTeamId} />
            <div className="playoff-versus">VS</div>
            <SeedTeam seed={matchup.awaySeed} userTeamId={userTeamId} />
          </article>
        ))}
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
  seed: ReturnType<typeof getPlayoffSeeds>[number];
  userTeamId: string;
};

function SeedTeam({ seed, userTeamId }: SeedTeamProps) {
  const isUserTeam = seed.standing.teamId === userTeamId;

  return (
    <div className={isUserTeam ? 'seed-team user-team' : 'seed-team'}>
      <span className="standings-rank">{seed.seed}</span>
      <span className="team-dot" style={{ background: seed.standing.primaryColor }} />
      <div>
        <strong>{seed.standing.teamName}</strong>
        <span>{seed.standing.wins}-{seed.standing.losses} · {seed.standing.pointDifference > 0 ? `+${seed.standing.pointDifference}` : seed.standing.pointDifference}</span>
      </div>
    </div>
  );
}
