import type { SimulatedGameResult } from '../game/simulateGame';
import type { Team } from '../types/basketball';

type MatchResultScreenProps = {
  latestResult: SimulatedGameResult | null;
  teams: Team[];
};

export function MatchResultScreen({ latestResult, teams }: MatchResultScreenProps) {
  if (!latestResult) {
    return (
      <section className="match-result-screen">
        <div className="screen-heading">
          <div>
            <p className="eyebrow">Match Centre</p>
            <h3>No result yet</h3>
            <p className="muted">Simulate a fixture from the dashboard to generate your first post-match report.</p>
          </div>
          <span className="chip">Awaiting tip-off</span>
        </div>

        <article className="panel empty-result-panel">
          <p className="eyebrow">Next Step</p>
          <h3>Go to Dashboard</h3>
          <p className="muted">Use Simulate Next Fixture or Simulate Round to create a result here.</p>
        </article>
      </section>
    );
  }

  const homeTeam = findTeam(latestResult.homeTeamId, teams);
  const awayTeam = findTeam(latestResult.awayTeamId, teams);
  const winner = findTeam(latestResult.winnerTeamId, teams);
  const sortedPerformers = [...latestResult.topPerformers].sort((a, b) => b.points - a.points);

  return (
    <section className="match-result-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Match Centre</p>
          <h3>{winner.name} win</h3>
          <p className="muted">{latestResult.summary}</p>
        </div>
        <span className="chip">{latestResult.matchupLabel}</span>
      </div>

      <article className="panel result-hero-panel">
        <div className="result-score-layout">
          <ResultTeam team={homeTeam} score={latestResult.homeScore} />
          <div className="result-centre-label">
            <span>FINAL</span>
            <strong>BSBL</strong>
          </div>
          <ResultTeam team={awayTeam} score={latestResult.awayScore} align="right" />
        </div>
      </article>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Top Performers</p>
              <h3>Game leaders</h3>
            </div>
            <span className="chip">Top 5</span>
          </div>

          <div className="box-score-list">
            {sortedPerformers.map((player) => (
              <div className="box-score-row" key={player.playerId}>
                <div>
                  <strong>{player.playerName}</strong>
                  <span>{player.teamName}</span>
                </div>
                <StatBlock label="PTS" value={player.points} />
                <StatBlock label="REB" value={player.rebounds} />
                <StatBlock label="AST" value={player.assists} />
              </div>
            ))}
          </div>
        </article>

        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Report</p>
              <h3>Match notes</h3>
            </div>
            <span className="chip">Assistant</span>
          </div>

          <div className="assistant-notes">
            <ResultNote title="Matchup read" body={`Pre-game read was: ${latestResult.matchupLabel}.`} />
            <ResultNote title="Winning side" body={`${winner.name} finished stronger and took the result.`} />
            <ResultNote title="Next improvement" body="Future versions will add quarter scores, tactical impact breakdown and full team box scores." />
          </div>
        </article>
      </section>
    </section>
  );
}

type ResultTeamProps = {
  align?: 'left' | 'right';
  score: number;
  team: Team;
};

function ResultTeam({ align = 'left', score, team }: ResultTeamProps) {
  return (
    <div className={align === 'right' ? 'result-team right' : 'result-team'}>
      <span className="result-team-badge" style={{ borderColor: team.primaryColor }}>{team.shortName}</span>
      <div>
        <strong>{team.name}</strong>
        <span>{team.city}</span>
      </div>
      <em>{score}</em>
    </div>
  );
}

type StatBlockProps = {
  label: string;
  value: number;
};

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

type ResultNoteProps = {
  title: string;
  body: string;
};

function ResultNote({ title, body }: ResultNoteProps) {
  return (
    <div className="assistant-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function findTeam(teamId: string, teams: Team[]) {
  const team = teams.find((candidate) => candidate.id === teamId);

  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  return team;
}
