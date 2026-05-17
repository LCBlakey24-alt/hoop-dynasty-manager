import { useEffect, useMemo, useState } from 'react';
import type { SimulatedGameResult } from '../game/simulateGame';
import type { PlayerConditionChange, PlayerDevelopmentChange, Standing, Team } from '../types/basketball';

type InboxMessageType = 'Result' | 'Medical' | 'Board' | 'Fixture' | 'Squad' | 'Development';

type InboxMessage = {
  id: string;
  type: InboxMessageType;
  title: string;
  body: string;
  tag: string;
  priority: 'Low' | 'Normal' | 'High';
  dueRound?: number;
};

type InboxScreenProps = {
  boardConfidence: number;
  currentRound: number;
  focusMode: 'My Team' | 'League';
  latestConditionReport: PlayerConditionChange[];
  latestDevelopmentReport: PlayerDevelopmentChange[];
  latestResult: SimulatedGameResult | null;
  nextAwayTeam: Team | null;
  nextHomeTeam: Team | null;
  selectedTeam: Team;
  standings: Standing[];
  userStanding: Standing | undefined;
  onNavigate: (view: 'Dashboard' | 'Tactics' | 'Development' | 'Board & Finance') => void;
};

export function InboxScreen({
  boardConfidence,
  currentRound,
  focusMode,
  latestConditionReport,
  latestDevelopmentReport,
  latestResult,
  nextAwayTeam,
  nextHomeTeam,
  selectedTeam,
  standings,
  userStanding,
  onNavigate,
}: InboxScreenProps) {
  const inboxStorageKey = `hoop-dynasty-inbox-state:${selectedTeam.id}`;
  const messages = useMemo(() => createInboxMessages({
    boardConfidence,
    currentRound,
    focusMode,
    latestConditionReport,
    latestDevelopmentReport,
    latestResult,
    nextAwayTeam,
    nextHomeTeam,
    selectedTeam,
    standings,
    userStanding,
  }), [boardConfidence, currentRound, focusMode, latestConditionReport, latestDevelopmentReport, latestResult, nextAwayTeam, nextHomeTeam, selectedTeam, standings, userStanding]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [snoozedIds, setSnoozedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Pinned' | 'Snoozed'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state = window.localStorage.getItem(inboxStorageKey);
    if (!state) return;
    try {
      const parsed = JSON.parse(state) as { readIds?: string[]; pinnedIds?: string[]; snoozedIds?: string[] };
      setReadIds(parsed.readIds ?? []);
      setPinnedIds(parsed.pinnedIds ?? []);
      setSnoozedIds(parsed.snoozedIds ?? []);
    } catch {
      // ignore malformed storage
    }
  }, [inboxStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(inboxStorageKey, JSON.stringify({ readIds, pinnedIds, snoozedIds }));
  }, [inboxStorageKey, readIds, pinnedIds, snoozedIds]);

  useEffect(() => {
    const validIds = new Set(messages.map((message) => message.id));
    setReadIds((current) => current.filter((id) => validIds.has(id)));
    setPinnedIds((current) => current.filter((id) => validIds.has(id)));
    setSnoozedIds((current) => current.filter((id) => validIds.has(id)));
  }, [messages]);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);
  const snoozedSet = useMemo(() => new Set(snoozedIds), [snoozedIds]);
  const visibleMessages = messages
    .filter((message) => (filter === 'Snoozed' ? snoozedSet.has(message.id) : !snoozedSet.has(message.id)))
    .filter((message) => (filter === 'Unread' ? !readSet.has(message.id) : filter === 'Pinned' ? pinnedSet.has(message.id) : true))
    .filter((message) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return `${message.title} ${message.body} ${message.tag} ${message.type}`.toLowerCase().includes(query);
    })
    .sort((a, b) => Number(pinnedSet.has(b.id)) - Number(pinnedSet.has(a.id)) || getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
  const highPriorityMessages = visibleMessages.filter((message) => message.priority === 'High');
  const medicalMessages = visibleMessages.filter((message) => message.type === 'Medical');
  const developmentMessages = visibleMessages.filter((message) => message.type === 'Development');
  const boardMessages = visibleMessages.filter((message) => message.type === 'Board');
  const unreadCount = visibleMessages.filter((message) => !readSet.has(message.id)).length;
  const pinnedCount = visibleMessages.filter((message) => pinnedSet.has(message.id)).length;
  const snoozedCount = messages.filter((message) => snoozedSet.has(message.id)).length;
  const overdueCount = visibleMessages.filter((message) => (message.dueRound ?? Number.MAX_SAFE_INTEGER) < currentRound && !readSet.has(message.id)).length;
  const nextAction = getRecommendedAction(visibleMessages);

  return (
    <section className="match-result-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Manager Inbox</p>
          <h3>Club updates</h3>
          <p className="muted">Key messages from your staff, medical team, board and match analysts.</p>
        </div>
        <span className="chip">{highPriorityMessages.length ? `${highPriorityMessages.length} urgent` : 'Up to date'}</span>
      </div>

      <section className="league-summary-grid">
        <SummaryCard label="Urgent" value={highPriorityMessages.length.toString()} helper="High-priority messages" />
        <SummaryCard label="Medical" value={medicalMessages.length.toString()} helper="Fitness and injury updates" />
        <SummaryCard label="Development" value={developmentMessages.length.toString()} helper="Player growth notes" />
        <SummaryCard label="Board" value={boardMessages.length.toString()} helper="Confidence and pressure" />
        <SummaryCard label="Unread" value={unreadCount.toString()} helper="Needs review" />
        <SummaryCard label="Pinned" value={pinnedCount.toString()} helper="Flagged items" />
        <SummaryCard label="Overdue" value={overdueCount.toString()} helper="Past due round" />
      </section>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recommended Action</p>
              <h3>{nextAction.title}</h3>
            </div>
            <span className={nextAction.priority === 'High' ? 'chip warning' : 'chip'}>{nextAction.priority}</span>
          </div>
          <div className="assistant-notes">
            <div className="assistant-note">
              <strong>{nextAction.title}</strong>
              <span>{nextAction.body}</span>
            </div>
          </div>
        </article>

        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Priority Stack</p>
              <h3>What matters most</h3>
            </div>
            <span className="chip">Sorted</span>
          </div>
          <div className="assistant-notes">
            {visibleMessages.slice(0, 3).map((message) => (
              <div className="assistant-note" key={`priority-${message.id}`}>
                <strong>{message.title}</strong>
                <span>{message.type} · {message.priority} · {message.tag}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inbox</p>
            <h3>{visibleMessages.length} messages</h3>
          </div>
          <span className="chip">Auto generated</span>
        </div>
        <div className="option-row" style={{ marginBottom: '1rem' }}>
          {(['All', 'Unread', 'Pinned', 'Snoozed'] as const).map((option) => (
            <button className={filter === option ? 'option-button active' : 'option-button'} key={option} onClick={() => setFilter(option)}>{option}</button>
          ))}
          <button className="option-button" onClick={() => setReadIds((current) => [...new Set([...current, ...visibleMessages.map((message) => message.id)])])}>Mark Visible Read</button>
          <button className="option-button" onClick={() => setReadIds((current) => current.filter((id) => !visibleMessages.some((message) => message.id === id)))}>Mark Visible Unread</button>
          <button className="option-button" onClick={() => setPinnedIds([])}>Clear Pins</button>
          <button className="option-button" onClick={() => setSnoozedIds([])}>Unsnooze All ({snoozedCount})</button>
        </div>
        <div className="option-row" style={{ marginBottom: '1rem' }}>
          <input
            aria-label="Search inbox messages"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search messages, tags or types"
          />
          {searchTerm && (
            <button className="option-button" onClick={() => setSearchTerm('')}>Clear Search</button>
          )}
        </div>

        <div className="box-score-list full-box-score-list">
          {visibleMessages.length === 0 && (
            <div className="box-score-row">
              <div>
                <strong>No messages match current filters</strong>
                <span>Try changing filter, unsnoozing, or clearing your search text.</span>
              </div>
            </div>
          )}
          {visibleMessages.map((message) => (
            <div className="box-score-row" key={message.id}>
              <div>
                <strong>{message.title}</strong>
                <span>{message.body}</span>
              </div>
              {getMessageAction(message, onNavigate)}
              <button className="option-button" onClick={() => setReadIds((current) => current.includes(message.id) ? current.filter((id) => id !== message.id) : [...current, message.id])}>{readSet.has(message.id) ? 'Mark Unread' : 'Mark Read'}</button>
              <button className="option-button" onClick={() => setPinnedIds((current) => current.includes(message.id) ? current.filter((id) => id !== message.id) : [...current, message.id])}>{pinnedSet.has(message.id) ? 'Unpin' : 'Pin'}</button>
              <button className="option-button" onClick={() => setSnoozedIds((current) => current.includes(message.id) ? current.filter((id) => id !== message.id) : [...current, message.id])}>{snoozedSet.has(message.id) ? 'Unsnooze' : 'Snooze'}</button>
              {message.type === 'Fixture' && (
                <button
                  className="option-button"
                  onClick={() => {
                    setReadIds((current) => current.includes(message.id) ? current : [...current, message.id]);
                    setSnoozedIds((current) => current.includes(message.id) ? current : [...current, message.id]);
                  }}
                >
                  Resolve
                </button>
              )}
              <StatPill label="TYPE" value={message.type} />
              <StatPill label="TAG" value={message.tag} />
              <StatPill label="PRIO" value={`${message.priority}${readSet.has(message.id) ? ' · Read' : ' · New'}`} />
              <StatPill
                label="DUE"
                value={message.dueRound
                  ? ((message.dueRound < currentRound && !readSet.has(message.id)) ? `R${message.dueRound} OVERDUE` : `R${message.dueRound}`)
                  : '—'}
              />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

type CreateInboxInput = Omit<InboxScreenProps, 'onNavigate'>;

function createInboxMessages({
  boardConfidence,
  currentRound,
  focusMode,
  latestConditionReport,
  latestDevelopmentReport,
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
      id: `latest-result-${latestResult.homeTeamId}-${latestResult.awayTeamId}-${latestResult.homeScore}-${latestResult.awayScore}`,
      type: 'Result',
      title: userPlayed ? (userWon ? 'Positive result boosts dressing room mood' : 'Staff review needed after latest result') : 'Latest league result logged',
      body: latestResult.summary,
      tag: userPlayed ? (userWon ? 'Win' : 'Review') : 'League',
      priority: userPlayed && !userWon ? 'High' : 'Normal',
      dueRound: currentRound + 1,
    });
  }

  const developmentBreakthroughs = latestDevelopmentReport.filter((report) => report.overallAfter > report.overallBefore);
  const topDevelopment = latestDevelopmentReport
    .filter((report) => report.progressGain > 0)
    .sort((a, b) => b.progressGain - a.progressGain)
    .slice(0, 2);

  developmentBreakthroughs.slice(0, 3).forEach((report) => {
    messages.push({
      id: `development-breakthrough-${report.playerId}`,
      type: 'Development',
      title: `${report.playerName} improves to ${report.overallAfter} OVR`,
      body: report.note,
      tag: 'Growth',
      priority: 'High',
    });
  });

  if (developmentBreakthroughs.length === 0 && topDevelopment.length > 0) {
    const best = topDevelopment[0];
    messages.push({
      id: 'development-progress',
      type: 'Development',
      title: `${best.playerName} showing development progress`,
      body: `${best.playerName} gained ${best.progressGain} development progress and is now ${best.nextProgress}% toward the next OVR step.`,
      tag: 'Progress',
      priority: 'Normal',
    });
  }

  const injuryReports = latestConditionReport.filter((report) => report.injury);
  const tiredReports = latestConditionReport.filter((report) => !report.injury && report.nextFatigue >= 65);
  const expiringContracts = selectedTeam.roster
    .filter((player) => player.contract && (player.contract.status === 'Expiring' || player.contract.status === 'Renewal Needed' || player.contract.yearsRemaining <= 1))
    .sort((a, b) => (a.contract?.yearsRemaining ?? 99) - (b.contract?.yearsRemaining ?? 99))
    .slice(0, 3);

  injuryReports.slice(0, 3).forEach((report) => {
    messages.push({
      id: `injury-${report.playerId}-${report.injury?.severity ?? 'none'}-${report.injury?.gamesRemaining ?? 0}`,
      type: 'Medical',
      title: `${report.playerName} requires medical management`,
      body: report.note,
      tag: report.injury?.severity ?? 'Injury',
      priority: report.injury?.severity === 'Major' || report.injury?.severity === 'Minor' ? 'High' : 'Normal',
      dueRound: currentRound + 1,
    });
  });

  if (tiredReports.length > 0) {
    const mostTired = [...tiredReports].sort((a, b) => b.nextFatigue - a.nextFatigue)[0];

    messages.push({
      id: `fatigue-warning-${mostTired.playerId}-${mostTired.nextFatigue}`,
      type: 'Medical',
      title: 'Fatigue levels rising across the rotation',
      body: `${mostTired.playerName} is at ${mostTired.nextFatigue} fatigue. Consider lowering minutes or using Conditioning training.`,
      tag: 'Fatigue',
      priority: mostTired.nextFatigue >= 80 ? 'High' : 'Normal',
      dueRound: currentRound + 1,
    });
  }

  expiringContracts.forEach((player) => {
    if (!player.contract) return;
    const urgent = player.contract.status === 'Renewal Needed' || player.contract.yearsRemaining <= 0;
    messages.push({
      id: `contract-${player.id}-${player.contract.status}-${player.contract.yearsRemaining}`,
      type: 'Squad',
      title: `${player.name} contract ${player.contract.status.toLowerCase()}`,
      body: `${player.name} has ${player.contract.yearsRemaining} season${player.contract.yearsRemaining === 1 ? '' : 's'} remaining. Plan renewal strategy or replacement cover.`,
      tag: 'Contract',
      priority: urgent ? 'High' : 'Normal',
      dueRound: currentRound + 2,
    });
  });

  messages.push({
    id: `board-confidence-${boardConfidence}-${userStanding?.wins ?? 0}-${userStanding?.losses ?? 0}`,
    type: 'Board',
    title: boardConfidence >= 75 ? 'Board confidence remains strong' : boardConfidence >= 55 ? 'Board monitoring league progress' : 'Board pressure increasing',
    body: `Current board confidence is ${boardConfidence}%. ${userStanding ? `Your record is ${userStanding.wins}-${userStanding.losses}.` : 'The season has not started yet.'}`,
    tag: `${boardConfidence}%`,
    priority: boardConfidence < 55 ? 'High' : 'Normal',
    dueRound: boardConfidence < 55 ? currentRound + 1 : undefined,
  });

  if (nextHomeTeam && nextAwayTeam) {
    messages.push({
      id: `next-fixture-${nextHomeTeam.id}-${nextAwayTeam.id}`,
      type: 'Fixture',
      title: 'Next match preparation available',
      body: `${nextHomeTeam.name} face ${nextAwayTeam.name}. Review tactics, minutes and fatigue before simulating.`,
      tag: 'Preview',
      priority: 'Normal',
      dueRound: currentRound,
    });
  } else {
    messages.push({
      id: `regular-season-complete-${standings.length}-${messages.length}`,
      type: 'Fixture',
      title: 'Regular season complete',
      body: 'All scheduled regular season fixtures have been played. Review the table and prepare for playoffs.',
      tag: 'Season',
      priority: 'Normal',
    });
  }

  messages.push({
    id: `league-position-${leaguePosition}-${userStanding?.wins ?? 0}-${userStanding?.losses ?? 0}`,
    type: 'Squad',
    title: leaguePosition > 0 ? `League position: ${getOrdinalPosition(leaguePosition)}` : 'League position pending',
    body: userStanding ? `${selectedTeam.name} have a ${userStanding.wins}-${userStanding.losses} record with ${userStanding.pointDifference >= 0 ? '+' : ''}${userStanding.pointDifference} point difference.` : 'Simulate your first game to generate a league position.',
    tag: 'Table',
    priority: leaguePosition > 0 && leaguePosition > Math.ceil(standings.length / 2) ? 'Normal' : 'Low',
  });

  const weightedMessages = focusMode === 'My Team'
    ? messages.filter((message) => !(message.priority === 'Low' && message.tag === 'League'))
    : messages;

  return weightedMessages.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function getRecommendedAction(messages: InboxMessage[]) {
  const urgent = messages.find((message) => message.priority === 'High');
  if (urgent) {
    return { title: urgent.title, body: urgent.body, priority: urgent.priority };
  }

  const fixture = messages.find((message) => message.type === 'Fixture');
  if (fixture) {
    return { title: fixture.title, body: fixture.body, priority: fixture.priority };
  }

  const board = messages.find((message) => message.type === 'Board');
  if (board) {
    return { title: board.title, body: board.body, priority: board.priority };
  }

  return { title: 'No urgent action', body: 'Your inbox has no immediate high-priority decisions.', priority: 'Low' as const };
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

function getMessageAction(
  message: InboxMessage,
  onNavigate: InboxScreenProps['onNavigate'],
) {
  if (message.type === 'Medical') {
    return <button className="option-button" onClick={() => onNavigate('Tactics')}>Open Tactics</button>;
  }

  if (message.type === 'Development') {
    return <button className="option-button" onClick={() => onNavigate('Development')}>Open Development</button>;
  }

  if (message.type === 'Board') {
    return <button className="option-button" onClick={() => onNavigate('Board & Finance')}>Open Board</button>;
  }

  if (message.type === 'Fixture') {
    return <button className="option-button" onClick={() => onNavigate('Dashboard')}>Open Dashboard</button>;
  }

  return null;
}
