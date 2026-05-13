import type { SimulatedGameResult } from '../game/simulateGame';
import type { PlayerConditionChange, Standing, Team } from '../types/basketball';

type InboxMessageType = 'Result' | 'Medical' | 'Board' | 'Fixture' | 'Squad';

type InboxMessage = {
  id: string;
  type: InboxMessageType;
  title: string;
  body: string;
  tag: string;
  priority: 'Low' | 'Normal' | 'High';
};

type InboxScreenProps = {
  boardConfidence: number;
  latestConditionReport: PlayerConditionChange[];
  latestResult: SimulatedGameResult | null;
  nextAwayTeam: Team | null;
  nextHomeTeam: Team | null;
  selectedTeam: Team;
  standings: Standing[];
  userStanding: Standing | undefined;
};

export function InboxScreen({
  boardConfidence,
  latestConditionReport,
  latestResult,
  nextAwayTeam,
  nextHomeTeam,
  selectedTeam,
  standings,
  userStanding,
}: InboxScreenProps) {
  const messages = createInboxMessages({
    boardConfidence,
    latestConditionReport,
    latestResult,
    nextAwayTeam,
    nextHomeTeam,
    selectedTeam,
    standings,
    userStanding,
  });
  const highPriorityCount = messages.filter((message) => message.priority === 'High').length;

  return (
    <section className="match-result-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Manager Inbox</p>
          <h3>Club updates</h3>
          <p className="muted">Key messages from your staff, medical team, board and match analysts.</p>
        </div>
        <span className="chip">{highPriorityCount ? `${highPriorityCount} urgent` : 'Up to date'}</span>
      </div>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inbox</p>
            <h3>{messages.length} messages</h3>
          </div>
          <span className="chip">Auto generated</span>
        </div>

        <div className="box-score-list full-box-score-list">
          {messages.map((message) => (
            <div className="box-score-row" key={message.id}>
              <div>
                <strong>{message.title}</strong>
                <span>{message.body}</span>
              </div>
              <StatPill label="TYPE" value={message.type} />
              <StatPill label="TAG" value={message.tag} />
              <StatPill label="PRIO" value={message.priority} />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

type CreateInboxInput = InboxScreenProps;

function createInboxMessages({
  boardConfidence,
  latestConditionReport,
  latestResult,
  nextAwayTeam,
  nextHomeTeam,
  selectedTeam,
  standings,
  userStanding,
}: CreateInboxInput): InboxMessage[] {
  const messages: InboxMessage[] = [];
  const leaguePosition = standings.findIndex((standing) => standing.teamId === selectedTeam.id) + 1;

  if (latestResult) {
    const userPlayed = latestResult.homeTeamId === selectedTeam.id || latestResult.awayTeamId === selectedTeam.id;
    const userWon = latestResult.winnerTeamId === selectedTeam.id;

    messages.push({
      id: 'latest-result',
      type: 'Result',
      title: userPlayed ? (userWon ? 'Positive result boosts dressing room mood' : 'Staff review needed after latest result') : 'Latest league result logged',
      body: latestResult.summary,
      tag: userPlayed ? (userWon ? 'Win' : 'Review') : 'League',
      priority: userPlayed && !userWon ? 'High' : 'Normal',
    });
  }

  const injuryReports = latestConditionReport.filter((report) => report.injury);
  const tiredReports = latestConditionReport.filter((report) => !report.injury && report.nextFatigue >= 65);

  injuryReports.slice(0, 3).forEach((report) => {
    messages.push({
      id: `injury-${report.playerId}`,
      type: 'Medical',
      title: `${report.playerName} requires medical management`,
      body: report.note,
      tag: report.injury?.severity ?? 'Injury',
      priority: report.injury?.severity === 'Major' || report.injury?.severity === 'Minor' ? 'High' : 'Normal',
    });
  });

  if (tiredReports.length > 0) {
    const mostTired = [...tiredReports].sort((a, b) => b.nextFatigue - a.nextFatigue)[0];

    messages.push({
      id: 'fatigue-warning',
      type: 'Medical',
      title: 'Fatigue levels rising across the rotation',
      body: `${mostTired.playerName} is at ${mostTired.nextFatigue} fatigue. Consider lowering minutes or using Conditioning training.`,
      tag: 'Fatigue',
      priority: mostTired.nextFatigue >= 80 ? 'High' : 'Normal',
    });
  }

  messages.push({
    id: 'board-confidence',
    type: 'Board',
    title: boardConfidence >= 75 ? 'Board confidence remains strong' : boardConfidence >= 55 ? 'Board monitoring league progress' : 'Board pressure increasing',
    body: `Current board confidence is ${boardConfidence}%. ${userStanding ? `Your record is ${userStanding.wins}-${userStanding.losses}.` : 'The season has not started yet.'}`,
    tag: `${boardConfidence}%`,
    priority: boardConfidence < 55 ? 'High' : 'Normal',
  });

  if (nextHomeTeam && nextAwayTeam) {
    messages.push({
      id: 'next-fixture',
      type: 'Fixture',
      title: 'Next match preparation available',
      body: `${nextHomeTeam.name} face ${nextAwayTeam.name}. Review tactics, minutes and fatigue before simulating.`,
      tag: 'Preview',
      priority: 'Normal',
    });
  } else {
    messages.push({
      id: 'regular-season-complete',
      type: 'Fixture',
      title: 'Regular season complete',
      body: 'All scheduled regular season fixtures have been played. Review the table and prepare for playoffs.',
      tag: 'Season',
      priority: 'Normal',
    });
  }

  messages.push({
    id: 'league-position',
    type: 'Squad',
    title: leaguePosition > 0 ? `League position: ${getOrdinalPosition(leaguePosition)}` : 'League position pending',
    body: userStanding ? `${selectedTeam.name} have a ${userStanding.wins}-${userStanding.losses} record with ${userStanding.pointDifference >= 0 ? '+' : ''}${userStanding.pointDifference} point difference.` : 'Simulate your first game to generate a league position.',
    tag: 'Table',
    priority: leaguePosition > 0 && leaguePosition > Math.ceil(standings.length / 2) ? 'Normal' : 'Low',
  });

  return messages.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getPriorityWeight(priority: InboxMessage['priority']) {
  if (priority === 'High') return 3;
  if (priority === 'Normal') return 2;
  return 1;
}

function getOrdinalPosition(position: number) {
  if (position <= 0) return '—';

  const suffix = position % 10 === 1 && position !== 11
    ? 'st'
    : position % 10 === 2 && position !== 12
      ? 'nd'
      : position % 10 === 3 && position !== 13
        ? 'rd'
        : 'th';

  return `${position}${suffix}`;
}
