import { useMemo, useState } from 'react';
import type { PlayerBoxScore, SimulatedGameResult } from '../game/simulateGame';
import type { PlayerConditionChange, Team } from '../types/basketball';

type MatchResultScreenProps = {
  latestConditionReport: PlayerConditionChange[];
  latestResult: SimulatedGameResult | null;
  results: SimulatedGameResult[];
  selectedTeamId: string;
  teams: Team[];
};

export function MatchResultScreen({ latestConditionReport, latestResult, results, selectedTeamId, teams }: MatchResultScreenProps) {
  const [historyFilter, setHistoryFilter] = useState<'All' | 'My Team'>('My Team');
  const filteredHistory = useMemo(() => {
    const base = [...results].reverse();

    if (historyFilter === 'All') return base;

    return base.filter((result) => result.homeTeamId === selectedTeamId || result.awayTeamId === selectedTeamId);
  }, [historyFilter, results, selectedTeamId]);

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
  const loser = latestResult.winnerTeamId === homeTeam.id ? awayTeam : homeTeam;
  const margin = Math.abs(latestResult.homeScore - latestResult.awayScore);
  const resultType = getResultType(margin);
  const sortedPerformers = [...latestResult.topPerformers].sort((a, b) => b.points - a.points);
  const topPerformer = sortedPerformers[0];
  const homeBoxScore = latestResult.homeBoxScore ?? latestResult.topPerformers.filter((player) => player.teamId === homeTeam.id);
  const awayBoxScore = latestResult.awayBoxScore ?? latestResult.topPerformers.filter((player) => player.teamId === awayTeam.id);

  return (
    <section className="match-result-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Match Centre</p>
          <h3>{winner.name} win</h3>
          <p className="muted">{latestResult.summary}</p>
        </div>
        <span className="chip">{resultType}</span>
      </div>

      <article className="panel result-hero-panel">
        <div className="result-score-layout">
          <ResultTeam team={homeTeam} score={latestResult.homeScore} />
          <div className="result-centre-label">
            <span>{resultType}</span>
            <strong>{margin}</strong>
            <span>POINT MARGIN</span>
          </div>
          <ResultTeam team={awayTeam} score={latestResult.awayScore} align="right" />
        </div>
      </article>

      <section className="league-summary-grid">
        <SummaryCard label="Winner" value={winner.shortName} helper={`${winner.name} by ${margin}`} />
        <SummaryCard label="Result Type" value={resultType} helper={getResultTypeHelper(margin)} />
        <SummaryCard label="Top Scorer" value={topPerformer?.playerName ?? '—'} helper={topPerformer ? `${topPerformer.points} PTS · ${topPerformer.teamName}` : 'No box score'} />
        <SummaryCard label="Matchup Read" value={latestResult.matchupLabel} helper="Pre-game simulation read" />
      </section>

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
              <BoxScoreRow player={player} key={player.playerId} />
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
            <ResultNote title="Result read" body={`${winner.name} beat ${loser.name} by ${margin}. ${getResultTypeHelper(margin)}`} />
            <ResultNote title="Player spotlight" body={topPerformer ? `${topPerformer.playerName} led the game with ${topPerformer.points} points, ${topPerformer.rebounds} rebounds and ${topPerformer.assists} assists.` : 'No standout performer was recorded.'} />
            <ResultNote title="Box score" body="Full player scoring, minutes, rebounding and assist totals are stored for newly simulated games." />
          </div>
        </article>
      </section>

      <ConditionReportPanel conditionReport={latestConditionReport} />

      <section className="result-grid">
        <TeamBoxScorePanel boxScore={homeBoxScore} team={homeTeam} />
        <TeamBoxScorePanel boxScore={awayBoxScore} team={awayTeam} />
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Results History</p>
            <h3>Recent games log</h3>
          </div>
          <span className="chip">{filteredHistory.length} games</span>
        </div>

        <div className="option-row" style={{ marginBottom: '1rem' }}>
          {(['My Team', 'All'] as const).map((option) => (
            <button
              className={historyFilter === option ? 'option-button active' : 'option-button'}
              key={option}
              onClick={() => setHistoryFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="box-score-list full-box-score-list">
          {filteredHistory.slice(0, 20).map((result, index) => {
            const home = findTeam(result.homeTeamId, teams);
            const away = findTeam(result.awayTeamId, teams);
            const winnerTeam = findTeam(result.winnerTeamId, teams);
            const historyMargin = Math.abs(result.homeScore - result.awayScore);
            return (
              <div className="box-score-row" key={`${result.homeTeamId}-${result.awayTeamId}-${index}`}>
                <div>
                  <strong>{home.shortName} {result.homeScore} - {result.awayScore} {away.shortName}</strong>
                  <span>{winnerTeam.name} won · {getResultType(historyMargin)} · {result.matchupLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="panel league-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
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

type ConditionReportPanelProps = {
  conditionReport: PlayerConditionChange[];
};

function ConditionReportPanel({ conditionReport }: ConditionReportPanelProps) {
  const notableReports = [...conditionReport]
    .sort((a, b) => Number(Boolean(b.injury)) - Number(Boolean(a.injury)) || b.nextFatigue - a.nextFatigue)
    .slice(0, 8);

  return (
    <article className="panel result-detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Fitness & Injury Report</p>
          <h3>Post-game condition</h3>
        </div>
        <span className="chip">{conditionReport.length ? `${conditionReport.length} players` : 'No report'}</span>
      </div>

      <div className="box-score-list full-box-score-list">
        {notableReports.length > 0 ? notableReports.map((report) => (
          <div className="box-score-row" key={report.playerId}>
            <div>
              <strong>{report.playerName}</strong>
              <span>{report.note}</span>
            </div>
            <StatBlock label="MIN" value={report.minutes} />
            <StatBlock label="FAT" value={report.nextFatigue} />
            <StatBlock label="FORM" value={report.nextForm} />
            <StatBlock label="MOR" value={report.nextMorale} />
          </div>
        )) : (
          <div className="box-score-row">
            <div>
              <strong>No condition report yet</strong>
              <span>Simulate one of your own games to generate player fatigue and injury notes.</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

type TeamBoxScorePanelProps = {
  boxScore: PlayerBoxScore[];
  team: Team;
};

function TeamBoxScorePanel({ boxScore, team }: TeamBoxScorePanelProps) {
  const sortedBoxScore = [...boxScore].sort((a, b) => b.points - a.points);
  const totalPoints = sortedBoxScore.reduce((total, player) => total + player.points, 0);
  const totalRebounds = sortedBoxScore.reduce((total, player) => total + player.rebounds, 0);
  const totalAssists = sortedBoxScore.reduce((total, player) => total + player.assists, 0);

  return (
    <article className="panel result-detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Team Box Score</p>
          <h3>{team.shortName} players</h3>
        </div>
        <span className="chip">{totalPoints} PTS · {totalRebounds} REB · {totalAssists} AST</span>
      </div>

      <div className="box-score-list full-box-score-list">
        {sortedBoxScore.length > 0 ? sortedBoxScore.map((player) => (
          <BoxScoreRow player={player} key={player.playerId} />
        )) : (
          <div className="box-score-row">
            <div>
              <strong>Legacy result</strong>
              <span>This saved match was created before full box scores existed.</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

type BoxScoreRowProps = {
  player: PlayerBoxScore;
};

function BoxScoreRow({ player }: BoxScoreRowProps) {
  return (
    <div className="box-score-row">
      <div>
        <strong>{player.playerName}</strong>
        <span>{player.teamName}</span>
      </div>
      <StatBlock label="MIN" value={player.minutes ?? 0} />
      <StatBlock label="PTS" value={player.points} />
      <StatBlock label="REB" value={player.rebounds} />
      <StatBlock label="AST" value={player.assists} />
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

function getResultType(margin: number) {
  if (margin <= 3) return 'Close Game';
  if (margin <= 9) return 'Competitive Win';
  if (margin <= 17) return 'Comfortable Win';
  return 'Statement Win';
}

function getResultTypeHelper(margin: number) {
  if (margin <= 3) return 'A one-possession finish with late-game pressure.';
  if (margin <= 9) return 'A competitive game decided by execution and composure.';
  if (margin <= 17) return 'A controlled win with clear separation.';
  return 'A dominant performance and a major confidence boost.';
}

function findTeam(teamId: string, teams: Team[]) {
  const team = teams.find((candidate) => candidate.id === teamId);

  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  return team;
}
