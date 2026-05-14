import {
  createFinalMatchup,
  createQuarterFinalMatchups,
  createSemiFinalMatchups,
  getChampion,
  getPlayoffSeeds,
  type PlayoffMatchup,
} from '../game/playoffs';
import type { SimulatedGameResult } from '../game/simulateGame';
import type { Standing } from '../types/basketball';

type PlayoffsScreenProps = {
  gamesPlayed: number;
  onSimulateFinal: () => void;
  onSimulateQuarterFinals: () => void;
  onSimulateSemiFinals: () => void;
  playoffResults: SimulatedGameResult[];
  standings: Standing[];
  totalGames: number;
  userTeamId: string;
};

export function PlayoffsScreen({
  gamesPlayed,
  onSimulateFinal,
  onSimulateQuarterFinals,
  onSimulateSemiFinals,
  playoffResults,
  standings,
  totalGames,
  userTeamId,
}: PlayoffsScreenProps) {
  const regularSeasonComplete = gamesPlayed >= totalGames;
  const playoffSeeds = getPlayoffSeeds(standings);
  const quarterFinals = createQuarterFinalMatchups(standings);
  const semiFinals = createSemiFinalMatchups(standings, playoffResults);
  const final = createFinalMatchup(standings, playoffResults);
  const champion = getChampion(standings, playoffResults);
  const userSeed = playoffSeeds.find((seed) => seed.standing.teamId === userTeamId);
  const userQualified = Boolean(userSeed);
  const topSeed = playoffSeeds[0];
  const lowestSeed = playoffSeeds.at(-1);
  const quarterFinalsComplete = quarterFinals.length > 0 && quarterFinals.every((matchup) => findMatchupResult(matchup, playoffResults));
  const semiFinalsComplete = semiFinals.length > 0 && semiFinals.every((matchup) => findMatchupResult(matchup, playoffResults));
  const finalComplete = !!final && !!findMatchupResult(final, playoffResults);
  const playoffState = getPlayoffState(regularSeasonComplete, quarterFinalsComplete, semiFinalsComplete, finalComplete, Boolean(champion));

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

        <section className="result-grid">
          <article className="panel playoff-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Playoff Picture</p>
                <h3>Current projection</h3>
              </div>
              <span className="chip">Locked after season</span>
            </div>
            <div className="assistant-notes">
              <PlayoffNote title="Top seed" body={topSeed ? `${topSeed.standing.teamName} currently lead the playoff race.` : 'No playoff race yet.'} />
              <PlayoffNote title="Cutline" body={standings[7] ? `${standings[7].teamName} currently hold the final playoff place.` : 'Top 8 will qualify once the table forms.'} />
              <PlayoffNote title="Your path" body={userQualified ? `Your club is currently seed ${userSeed?.seed}.` : 'Your club is currently outside the playoff places.'} />
            </div>
          </article>

          <article className="panel playoff-panel">
            <p className="eyebrow">Current Top 8</p>
            <h3>Projected qualifiers</h3>
            <SeedList seeds={playoffSeeds} userTeamId={userTeamId} />
          </article>
        </section>
      </section>
    );
  }

  return (
    <section className="playoffs-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">BSBL Playoffs</p>
          <h3>{champion ? `${champion.standing.teamName} are champions` : 'Postseason bracket'}</h3>
          <p className="muted">The top 8 regular season teams have qualified. Simulate each stage to crown the BSBL champion.</p>
        </div>
        <span className="chip">{playoffState}</span>
      </div>

      <section className="playoff-summary-grid">
        <SummaryCard label="Top Seed" value={topSeed?.standing.shortName ?? '—'} helper={topSeed ? topSeed.standing.teamName : 'Awaiting bracket'} />
        <SummaryCard label="Lowest Seed" value={lowestSeed?.standing.shortName ?? '—'} helper={lowestSeed ? lowestSeed.standing.teamName : 'Awaiting bracket'} />
        <SummaryCard label="Your Status" value={userQualified ? `Seed ${userSeed?.seed}` : 'Eliminated'} helper="Based on final table" />
        <SummaryCard label="Champion" value={champion?.standing.shortName ?? 'TBD'} helper={champion ? champion.standing.teamName : 'Final pending'} />
      </section>

      <section className="result-grid">
        <article className="panel playoff-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Next Action</p>
              <h3>Postseason control</h3>
            </div>
            <span className="chip">{getNextActionLabel(quarterFinalsComplete, semiFinalsComplete, finalComplete, Boolean(champion))}</span>
          </div>

          <div className="assistant-notes">
            <PlayoffNote title="Bracket status" body={getBracketStatusText(quarterFinalsComplete, semiFinalsComplete, finalComplete, Boolean(champion))} />
            <PlayoffNote title="User club" body={userQualified ? `Your club qualified as seed ${userSeed?.seed}.` : 'Your club missed the postseason and can only watch the bracket unfold.'} />
          </div>
        </article>

        <article className="panel playoff-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Race Story</p>
              <h3>Seeds and threats</h3>
            </div>
            <span className="chip">Scout view</span>
          </div>

          <div className="assistant-notes">
            <PlayoffNote title="Favourite" body={topSeed ? `${topSeed.standing.teamName} enter as the top seed with a ${topSeed.standing.wins}-${topSeed.standing.losses} record.` : 'No favourite yet.'} />
            <PlayoffNote title="Dark horse" body={lowestSeed ? `${lowestSeed.standing.teamName} are the lowest seed but still alive in the bracket.` : 'No dark horse yet.'} />
          </div>
        </article>
      </section>

      {!quarterFinalsComplete && (
        <button className="primary-action playoff-action" onClick={onSimulateQuarterFinals}>Simulate Quarter-Finals</button>
      )}

      {quarterFinalsComplete && !semiFinalsComplete && (
        <button className="primary-action playoff-action" onClick={onSimulateSemiFinals}>Simulate Semi-Finals</button>
      )}

      {semiFinalsComplete && final && !finalComplete && (
        <button className="primary-action playoff-action" onClick={onSimulateFinal}>Simulate Final</button>
      )}

      {champion && (
        <article className="panel champion-panel">
          <p className="eyebrow">BSBL Champion</p>
          <h3>{champion.standing.teamName}</h3>
          <p className="muted">Seed {champion.seed} completed the postseason run and lifted the title.</p>
        </article>
      )}

      <section className="playoff-stage-grid">
        <PlayoffStage matchups={quarterFinals} playoffResults={playoffResults} title="Quarter-Finals" userTeamId={userTeamId} />
        <PlayoffStage matchups={semiFinals} playoffResults={playoffResults} title="Semi-Finals" userTeamId={userTeamId} />
        <PlayoffStage matchups={final ? [final] : []} playoffResults={playoffResults} title="Final" userTeamId={userTeamId} />
      </section>
    </section>
  );
}

type PlayoffStageProps = {
  matchups: PlayoffMatchup[];
  playoffResults: SimulatedGameResult[];
  title: string;
  userTeamId: string;
};

function PlayoffStage({ matchups, playoffResults, title, userTeamId }: PlayoffStageProps) {
  return (
    <article className="panel playoff-stage-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Playoff Stage</p>
          <h3>{title}</h3>
        </div>
        <span className="chip">{matchups.length ? `${countCompleted(matchups, playoffResults)}/${matchups.length}` : 'Locked'}</span>
      </div>

      <div className="playoff-stage-list">
        {matchups.length ? matchups.map((matchup) => (
          <PlayoffMatchupCard matchup={matchup} playoffResults={playoffResults} userTeamId={userTeamId} key={matchup.id} />
        )) : (
          <p className="muted">This stage unlocks after the previous round is complete.</p>
        )}
      </div>
    </article>
  );
}

type PlayoffMatchupCardProps = {
  matchup: PlayoffMatchup;
  playoffResults: SimulatedGameResult[];
  userTeamId: string;
};

function PlayoffMatchupCard({ matchup, playoffResults, userTeamId }: PlayoffMatchupCardProps) {
  const result = findMatchupResult(matchup, playoffResults);
  const winnerId = result?.winnerTeamId;

  return (
    <div className="playoff-matchup-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{matchup.round}</p>
          <strong>Seed {matchup.homeSeed.seed} vs Seed {matchup.awaySeed.seed}</strong>
        </div>
        <span className="chip">{result ? 'Final' : 'Pending'}</span>
      </div>
      <SeedTeam resultScore={result?.homeScore} seed={matchup.homeSeed} userTeamId={userTeamId} winnerId={winnerId} />
      <div className="playoff-versus">VS</div>
      <SeedTeam resultScore={result?.awayScore} seed={matchup.awaySeed} userTeamId={userTeamId} winnerId={winnerId} />
    </div>
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

function PlayoffNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
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

function findMatchupResult(matchup: PlayoffMatchup, playoffResults: SimulatedGameResult[]) {
  return playoffResults.find((candidate) => candidate.homeTeamId === matchup.homeSeed.standing.teamId && candidate.awayTeamId === matchup.awaySeed.standing.teamId);
}

function countCompleted(matchups: PlayoffMatchup[], playoffResults: SimulatedGameResult[]) {
  return matchups.filter((matchup) => findMatchupResult(matchup, playoffResults)).length;
}

function getPlayoffState(regularSeasonComplete: boolean, quarterFinalsComplete: boolean, semiFinalsComplete: boolean, finalComplete: boolean, hasChampion: boolean) {
  if (!regularSeasonComplete) return 'Race active';
  if (hasChampion) return 'Champion crowned';
  if (finalComplete) return 'Final complete';
  if (semiFinalsComplete) return 'Final ready';
  if (quarterFinalsComplete) return 'Semi-finals ready';
  return 'Quarter-finals ready';
}

function getNextActionLabel(quarterFinalsComplete: boolean, semiFinalsComplete: boolean, finalComplete: boolean, hasChampion: boolean) {
  if (hasChampion || finalComplete) return 'Complete';
  if (semiFinalsComplete) return 'Sim final';
  if (quarterFinalsComplete) return 'Sim semis';
  return 'Sim quarters';
}

function getBracketStatusText(quarterFinalsComplete: boolean, semiFinalsComplete: boolean, finalComplete: boolean, hasChampion: boolean) {
  if (hasChampion || finalComplete) return 'The postseason is complete and the champion has been crowned.';
  if (semiFinalsComplete) return 'The finalists are set. One game remains to decide the title.';
  if (quarterFinalsComplete) return 'Quarter-finals are complete. Semi-finals are ready to simulate.';
  return 'Quarter-finals are ready. Simulate the opening stage to begin the postseason.';
}
