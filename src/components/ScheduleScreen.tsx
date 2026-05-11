import type { Fixture, Team } from '../types/basketball';
import type { SimulatedGameResult } from '../game/simulateGame';

type ScheduleScreenProps = {
  currentRound: number;
  fixtures: Fixture[];
  results: SimulatedGameResult[];
  teams: Team[];
  totalRounds: number;
};

export function ScheduleScreen({ currentRound, fixtures, results, teams, totalRounds }: ScheduleScreenProps) {
  const groupedFixtures = groupFixturesByRound(fixtures);
  const playedCount = results.length;

  return (
    <section className="schedule-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Season Schedule</p>
          <h3>BSBL regular season</h3>
          <p className="muted">Track every regular season fixture, simulated result and upcoming round.</p>
        </div>
        <span className="chip">{playedCount}/{fixtures.length} games played</span>
      </div>

      <section className="schedule-summary-grid">
        <SummaryCard label="Current Round" value={`${currentRound}/${totalRounds}`} helper="Next unplayed fixture round" />
        <SummaryCard label="Total Fixtures" value={fixtures.length.toString()} helper="Double round-robin season" />
        <SummaryCard label="Games Played" value={playedCount.toString()} helper="Completed fixtures" />
        <SummaryCard label="Games Remaining" value={(fixtures.length - playedCount).toString()} helper="Regular season games left" />
      </section>

      <article className="panel schedule-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Fixtures</p>
            <h3>Round-by-round schedule</h3>
          </div>
          <span className="chip">22 rounds</span>
        </div>

        <div className="round-list">
          {groupedFixtures.map(([round, roundFixtures]) => (
            <section className={Number(round) === currentRound ? 'round-block active' : 'round-block'} key={round}>
              <div className="round-header">
                <strong>Round {round}</strong>
                <span>{countPlayedFixtures(roundFixtures, results)}/{roundFixtures.length} played</span>
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
          ))}
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
