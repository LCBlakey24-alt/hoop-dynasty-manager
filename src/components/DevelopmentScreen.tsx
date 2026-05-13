import type { Player, PlayerDevelopmentChange, Team } from '../types/basketball';

type DevelopmentScreenProps = {
  latestDevelopmentReport: PlayerDevelopmentChange[];
  team: Team;
};

export function DevelopmentScreen({ latestDevelopmentReport, team }: DevelopmentScreenProps) {
  const prospects = [...team.roster]
    .sort((a, b) => getDevelopmentScore(b) - getDevelopmentScore(a))
    .slice(0, 6);
  const breakthroughReports = latestDevelopmentReport.filter((report) => report.overallAfter > report.overallBefore);
  const topProgressReports = [...latestDevelopmentReport]
    .filter((report) => report.progressGain > 0)
    .sort((a, b) => b.progressGain - a.progressGain)
    .slice(0, 6);
  const highestCeiling = [...team.roster].sort((a, b) => b.potential - a.potential)[0];
  const closestToGrowth = [...team.roster]
    .filter((player) => player.overall < player.potential)
    .sort((a, b) => (b.developmentProgress ?? 0) - (a.developmentProgress ?? 0))[0];
  const averageProgress = Math.round(team.roster.reduce((total, player) => total + (player.developmentProgress ?? 0), 0) / team.roster.length);

  return (
    <section className="roster-screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Development Hub</p>
          <h3>{team.name} growth plan</h3>
          <p className="muted">Track young players, recent growth and who needs minutes to reach their ceiling.</p>
        </div>
        <span className="chip">Academy view</span>
      </div>

      <section className="roster-summary-grid">
        <SummaryCard label="Highest Ceiling" value={highestCeiling.name} helper={`${highestCeiling.potential} POT · ${highestCeiling.age} years old`} />
        <SummaryCard label="Closest Growth" value={closestToGrowth?.name ?? 'No active growth'} helper={closestToGrowth ? `${closestToGrowth.developmentProgress ?? 0}% to next OVR` : 'Everyone is at ceiling'} />
        <SummaryCard label="Avg Progress" value={`${averageProgress}%`} helper="Squad development meter" />
        <SummaryCard label="Breakthroughs" value={breakthroughReports.length.toString()} helper="Latest post-game report" />
      </section>

      <section className="result-grid">
        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Prospect Watch</p>
              <h3>Best development profiles</h3>
            </div>
            <span className="chip">Top 6</span>
          </div>

          <div className="box-score-list full-box-score-list">
            {prospects.map((player) => (
              <DevelopmentPlayerRow player={player} key={player.id} />
            ))}
          </div>
        </article>

        <article className="panel result-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Coach Notes</p>
              <h3>Recommended actions</h3>
            </div>
            <span className="chip">Staff view</span>
          </div>

          <div className="assistant-notes">
            {createCoachNotes(team).map((note) => (
              <div className="assistant-note" key={note.title}>
                <strong>{note.title}</strong>
                <span>{note.body}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <article className="panel result-detail-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Latest Development Report</p>
            <h3>Post-game growth</h3>
          </div>
          <span className="chip">{latestDevelopmentReport.length ? `${latestDevelopmentReport.length} players` : 'No report'}</span>
        </div>

        <div className="box-score-list full-box-score-list">
          {topProgressReports.length > 0 ? topProgressReports.map((report) => (
            <div className="box-score-row" key={report.playerId}>
              <div>
                <strong>{report.playerName}</strong>
                <span>{report.note}</span>
              </div>
              <StatBlock label="GAIN" value={`+${report.progressGain}`} />
              <StatBlock label="PROG" value={`${report.nextProgress}%`} />
              <StatBlock label="OVR" value={`${report.overallBefore}→${report.overallAfter}`} />
            </div>
          )) : (
            <div className="box-score-row">
              <div>
                <strong>No development report yet</strong>
                <span>Simulate a managed-team game to generate player development progress.</span>
              </div>
            </div>
          )}
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
    <article className="panel roster-summary-card">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span className="muted">{helper}</span>
    </article>
  );
}

function DevelopmentPlayerRow({ player }: { player: Player }) {
  const progress = player.developmentProgress ?? 0;
  const gap = Math.max(0, player.potential - player.overall);

  return (
    <div className="box-score-row">
      <div>
        <strong>{player.name}</strong>
        <span>{player.age} · {player.position} · {player.archetype}</span>
      </div>
      <StatBlock label="OVR" value={player.overall.toString()} />
      <StatBlock label="POT" value={player.potential.toString()} />
      <StatBlock label="GAP" value={`+${gap}`} />
      <StatBlock label="PROG" value={`${progress}%`} />
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-block">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function createCoachNotes(team: Team) {
  const developmentCandidates = [...team.roster]
    .filter((player) => player.overall < player.potential)
    .sort((a, b) => getDevelopmentScore(b) - getDevelopmentScore(a));
  const tiredProspect = developmentCandidates.find((player) => (player.fatigue ?? 0) >= 65);
  const injuredProspect = developmentCandidates.find((player) => player.injury);
  const lowMinutesCandidate = developmentCandidates.find((player) => player.role === 'Prospect' || player.role === 'Depth');
  const notes = [];

  if (developmentCandidates[0]) {
    notes.push({
      title: 'Priority development player',
      body: `${developmentCandidates[0].name} has the best growth profile right now. Meaningful minutes will help turn potential into OVR.`,
    });
  }

  if (lowMinutesCandidate) {
    notes.push({
      title: 'Minutes pathway',
      body: `${lowMinutesCandidate.name} may need a clearer rotation pathway. Low minutes produce slower growth.`,
    });
  }

  if (tiredProspect) {
    notes.push({
      title: 'Fatigue warning',
      body: `${tiredProspect.name} is carrying ${tiredProspect.fatigue ?? 0} fatigue. Development will slow if they are overplayed.`,
    });
  }

  if (injuredProspect) {
    notes.push({
      title: 'Medical impact',
      body: `${injuredProspect.name} is carrying ${injuredProspect.injury?.type}. Rest and lighter minutes will protect development.`,
    });
  }

  if (notes.length === 0) {
    notes.push({
      title: 'Squad at ceiling',
      body: 'Most players are close to their current projected ceiling. Future growth may require recruitment or academy investment.',
    });
  }

  return notes;
}

function getDevelopmentScore(player: Player) {
  const potentialGap = Math.max(0, player.potential - player.overall);
  const ageBoost = Math.max(0, 28 - player.age);
  const progress = player.developmentProgress ?? 0;
  const injuryPenalty = player.injury ? 12 : 0;
  const fatiguePenalty = (player.fatigue ?? 0) >= 70 ? 8 : 0;

  return potentialGap * 3 + ageBoost * 2 + progress * 0.2 - injuryPenalty - fatiguePenalty;
}
