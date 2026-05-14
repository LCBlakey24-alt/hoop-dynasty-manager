import type { Fixture, Team } from '../types/basketball';
import type { SimulatedGameResult } from '../game/simulateGame';

type ScheduleScreenProps = {
  currentRound: number;
  fixtures: Fixture[];
  focusMode: 'My Team' | 'League';
  results: SimulatedGameResult[];
  selectedTeamId: string;
  teams: Team[];
  totalRounds: number;
};

export function ScheduleScreen({ currentRound, fixtures, focusMode, results, selectedTeamId, teams, totalRounds }: ScheduleScreenProps) {
  const groupedFixtures = groupFixturesByRound(fixtures);
  const playedCount = results.length;
  const nextFixture = fixtures.find((fixture) => !findResultForFixture(fixture, results));
  const latestResult = focusMode === 'My Team'
    ? [...results].reverse().find((result) => result.homeTeamId === selectedTeamId || result.awayTeamId === selectedTeamId) ?? null
    : results.at(-1) ?? null;
  const currentRoundFixtures = fixtures.filter((fixture) => fixture.round === currentRound);
  const currentRoundPlayed = countPlayedFixtures(currentRoundFixtures, results);

  return (
    <section className="schedule-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Season Schedule</p>
          <h3>{focusMode === 'My Team' ? 'My team schedule' : 'BSBL regular season'}</h3>
          <p className="muted">{focusMode === 'My Team' ? 'Track only your team fixtures, results and next game prep.' : 'Track every regular season fixture, simulated result and upcoming round.'}</p>
        </div>
        <span className="chip">{playedCount}/{fixtures.length} games played</span>
      </div>

      <section className="schedule-summary-grid">
        <SummaryCard label="Current Round" value={`${currentRound}/${totalRounds}`} helper={`${currentRoundPlayed}/${currentRoundFixtures.length || 0} round fixtures played`} />
        <SummaryCard label="Next Fixture" value={nextFixture ? getFixtureShortLabel(nextFixture, teams) : 'Season Complete'} helper={nextFixture ? `Round ${nextFixture.round}` : 'Regular season finished'} />
        <SummaryCard label="Latest Result" value={latestResult ? getResultShortLabel(latestResult, teams) : 'No Result'} helper={latestResult ? getWinnerLabel(latestResult, teams) : 'Simulate a fixture'} />
        <SummaryCard label="Games Remaining" value={(fixtures.length - playedCount).toString()} helper="Regular season games left" />
      </section>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Next Up</p>
              <h3>Fixture preview</h3>
            </div>
            <span className="chip">Planner</span>
          </div>

          <div className="assistant-notes">
            {nextFixture ? (
              <>
                <div className="assistant-note">
                  <strong>{getFixtureFullLabel(nextFixture, teams)}</strong>
                  <span>Review rotation, fitness and tactics before simulating this matchup.</span>
                </div>
                <div className="assistant-note">
                  <strong>Round status</strong>
                  <span>Round {currentRound} is {currentRoundPlayed}/{currentRoundFixtures.length} complete.</span>
                </div>
              </>
            ) : (
              <div className="assistant-note">
                <strong>Regular season complete</strong>
                <span>All fixtures have been played. Review the league table and prepare for playoffs.</span>
              </div>
            )}
          </div>
        </article>

        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Season Pace</p>
              <h3>Progress tracker</h3>
            </div>
            <span className="chip">{Math.round((playedCount / fixtures.length) * 100)}%</span>
          </div>

          <div className="assistant-notes">
            <div className="assistant-note">
              <strong>Completed</strong>
              <span>{playedCount} of {fixtures.length} regular-season fixtures have been played.</span>
            </div>
            <div className="assistant-note">
              <strong>Remaining</strong>
              <span>{fixtures.length - playedCount} games remain before playoff seeding is finalised.</span>
            </div>
          </div>
        </article>
      </section>

      <article className="panel schedule-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Fixtures</p>
            <h3>Round-by-round schedule</h3>
          </div>
          <span className="chip">{totalRounds} rounds</span>
        </div>

        <div className="round-list">
          {groupedFixtures.map(([round, roundFixtures]) => {
            const playedFixtures = countPlayedFixtures(roundFixtures, results);
            const status = getRoundStatus(round, currentRound, playedFixtures, roundFixtures.length);

            return (
              <section className={Number(round) === currentRound ? 'round-block active' : 'round-block'} key={round}>
                <div className="round-header">
                  <strong>Round {round}</strong>
                  <span>{status} · {playedFixtures}/{roundFixtures.length} played</span>
                </div>

                <div className="fixture-list">
                  {roundFixtures.map((fixture) => {
                    const result = findResultForFixture(fixture, results);
                    const homeTeam = findTeam(fixture.homeTeamId, teams);
                    const awayTeam = findTeam(fixture.awayTeamId, teams);

                    return (
                      <div className="fixture-row" key={fixture.id}>
                        <TeamLabel team={homeTeam} />
                        <FixtureScore fixture={fixture} result={result} />
                        <TeamLabel team={awayTeam} align="right" />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </article>
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
    <article className="panel schedule-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

type TeamLabelProps = {
  align?: 'left' | 'right';
  team: Team;
};

function TeamLabel({ align = 'left', team }: TeamLabelProps) {
  return (
    <div className={align === 'right' ? 'fixture-team right' : 'fixture-team'}>
      <span className="team-dot" style={{ background: team.primaryColor }} />
      <strong>{team.shortName}</strong>
      <span>{team.name}</span>
    </div>
  );
}

type FixtureScoreProps = {
  fixture: Fixture;
  result: SimulatedGameResult | undefined;
};

function FixtureScore({ fixture, result }: FixtureScoreProps) {
  if (!result) {
    return (
      <div className="fixture-score pending">
        <span>Pending</span>
      </div>
    );
  }

  return (
    <div className="fixture-score final">
      <strong>{result.homeScore}</strong>
      <span>FINAL</span>
      <strong>{result.awayScore}</strong>
      <small>{fixture.id}</small>
    </div>
  );
}

function groupFixturesByRound(fixtures: Fixture[]) {
  const groups = new Map<number, Fixture[]>();

  fixtures.forEach((fixture) => {
    const roundFixtures = groups.get(fixture.round) ?? [];
    roundFixtures.push(fixture);
    groups.set(fixture.round, roundFixtures);
  });

  return Array.from(groups.entries()).sort(([a], [b]) => a - b);
}

function countPlayedFixtures(fixtures: Fixture[], results: SimulatedGameResult[]) {
  return fixtures.filter((fixture) => findResultForFixture(fixture, results)).length;
}

function findResultForFixture(fixture: Fixture, results: SimulatedGameResult[]) {
  return results.find((result) => result.homeTeamId === fixture.homeTeamId && result.awayTeamId === fixture.awayTeamId);
}

function findTeam(teamId: string, teams: Team[]) {
  const team = teams.find((candidate) => candidate.id === teamId);

  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  return team;
}

function getFixtureShortLabel(fixture: Fixture, teams: Team[]) {
  const homeTeam = findTeam(fixture.homeTeamId, teams);
  const awayTeam = findTeam(fixture.awayTeamId, teams);
  return `${homeTeam.shortName} vs ${awayTeam.shortName}`;
}

function getFixtureFullLabel(fixture: Fixture, teams: Team[]) {
  const homeTeam = findTeam(fixture.homeTeamId, teams);
  const awayTeam = findTeam(fixture.awayTeamId, teams);
  return `${homeTeam.name} vs ${awayTeam.name}`;
}

function getResultShortLabel(result: SimulatedGameResult, teams: Team[]) {
  const homeTeam = findTeam(result.homeTeamId, teams);
  const awayTeam = findTeam(result.awayTeamId, teams);
  return `${homeTeam.shortName} ${result.homeScore}-${result.awayScore} ${awayTeam.shortName}`;
}

function getWinnerLabel(result: SimulatedGameResult, teams: Team[]) {
  return `${findTeam(result.winnerTeamId, teams).name} won`;
}

function getRoundStatus(round: number, currentRound: number, playedFixtures: number, totalFixtures: number) {
  if (playedFixtures === totalFixtures) return 'Complete';
  if (round === currentRound) return 'Current';
  if (round < currentRound) return 'Part-played';
  return 'Upcoming';
}
