import { useMemo, useState } from 'react';
import { createLeague, getStandings } from './league.js';
import { simulateGame } from './gameSim.js';
import { clearLeague, loadLeague, saveLeague } from './storage.js';
import { normalizeLineup } from './team.js';

export function App() {
  const [league, setLeague] = useState<any>(() => loadLeague());
  const [userTeamId, setUserTeamId] = useState<string>('team-1');
  const [homeTeamId, setHomeTeamId] = useState<string>('team-1');
  const [awayTeamId, setAwayTeamId] = useState<string>('team-2');
  const [lastGame, setLastGame] = useState<any>(null);

  const standings = useMemo(() => (league ? getStandings(league) : []), [league]);
  const userTeam = league?.teams.find((t: any) => t.id === userTeamId) ?? null;

  function handleCreateLeague() {
    const next = createLeague('Hardwood Dynasty League');
    setLeague(next);
    setUserTeamId(next.teams[0].id);
    setHomeTeamId(next.teams[0].id);
    setAwayTeamId(next.teams[1].id);
    setLastGame(null);
    saveLeague(next);
  }

  function handleAdvanceDay() {
    if (!league) return;
    const next = { ...league, day: league.day + 1 };
    setLeague(next);
    saveLeague(next);
  }

  function handleSimulateSelectedGame() {
    if (!league || homeTeamId === awayTeamId) return;
    const teams = [...league.teams];
    const home = teams.find((t) => t.id === homeTeamId);
    const away = teams.find((t) => t.id === awayTeamId);
    if (!home || !away) return;

    const result = simulateGame(home, away);
    result.day = league.day;

    const next = { ...league, teams, gameLog: [...league.gameLog, result] };
    setLeague(next);
    setLastGame(result);
    saveLeague(next);
  }

  function handleSetLineup(playerId: string, slot: 'Starter' | 'Bench') {
    if (!league || !userTeam) return;
    const teams = league.teams.map((team: any) => {
      if (team.id !== userTeam.id) return team;
      const roster = team.roster.map((player: any) => (player.id === playerId ? { ...player, lineupSlot: slot } : player));
      return normalizeLineup({ ...team, roster });
    });
    const next = { ...league, teams };
    setLeague(next);
    saveLeague(next);
  }

  if (!league) {
    return (
      <main>
        <h1>Hardwood Dynasty</h1>
        <p>v0.1 MVP</p>
        <button onClick={handleCreateLeague}>Create New League (20 Teams)</button>
        <button onClick={() => setLeague(loadLeague())}>Load Saved League</button>
      </main>
    );
  }

  return (
    <main>
      <h1>Hardwood Dynasty</h1>
      <p>League: {league.leagueName} | Day {league.day}</p>
      <button onClick={handleAdvanceDay}>Advance One Day</button>
      <button onClick={() => saveLeague(league)}>Save League</button>
      <button onClick={() => setLeague(loadLeague())}>Load League</button>
      <button onClick={() => { clearLeague(); setLeague(null); }}>Hard Reset</button>

      <h2>Simulate Game</h2>
      <label>Home Team: </label>
      <select value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
        {league.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <label> Away Team: </label>
      <select value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
        {league.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <button onClick={handleSimulateSelectedGame}>Simulate One Game</button>

      {lastGame && (
        <section>
          <h3>Last Game (Day {lastGame.day})</h3>
          <p>{lastGame.homeTeamId} {lastGame.homeScore} - {lastGame.awayScore} {lastGame.awayTeamId}</p>
          <table border={1}><thead><tr><th colSpan={5}>Home Box Score</th></tr><tr><th>Player</th><th>PTS</th><th>REB</th><th>AST</th><th>TOV</th></tr></thead><tbody>
            {lastGame.homeBox.map((row: any) => <tr key={row.playerId}><td>{row.name}</td><td>{row.points}</td><td>{row.rebounds}</td><td>{row.assists}</td><td>{row.turnovers}</td></tr>)}
          </tbody></table>
          <table border={1}><thead><tr><th colSpan={5}>Away Box Score</th></tr><tr><th>Player</th><th>PTS</th><th>REB</th><th>AST</th><th>TOV</th></tr></thead><tbody>
            {lastGame.awayBox.map((row: any) => <tr key={row.playerId}><td>{row.name}</td><td>{row.points}</td><td>{row.rebounds}</td><td>{row.assists}</td><td>{row.turnovers}</td></tr>)}
          </tbody></table>
        </section>
      )}

      <h2>Team Management</h2>
      <label>User Team: </label>
      <select value={userTeamId} onChange={(e) => setUserTeamId(e.target.value)}>
        {league.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      {userTeam && (
        <table border={1}>
          <thead>
            <tr><th>Name</th><th>Pos</th><th>Age</th><th>OVR</th><th>Contract</th><th>Lineup</th><th>G</th><th>PTS</th><th>REB</th><th>AST</th><th>TOV</th></tr>
          </thead>
          <tbody>
            {userTeam.roster.map((p: any) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.position}</td><td>{p.age}</td><td>{p.overall}</td><td>{p.contract}</td>
                <td>
                  <button onClick={() => handleSetLineup(p.id, 'Starter')}>Starter</button>
                  <button onClick={() => handleSetLineup(p.id, 'Bench')}>Bench</button>
                  {p.lineupSlot}
                </td>
                <td>{p.season.games}</td><td>{p.season.points}</td><td>{p.season.rebounds}</td><td>{p.season.assists}</td><td>{p.season.turnovers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>League Standings</h2>
      <table border={1}>
        <thead><tr><th>Rank</th><th>Team</th><th>W</th><th>L</th><th>PCT</th></tr></thead>
        <tbody>
          {standings.map((t, idx) => <tr key={t.id}><td>{idx + 1}</td><td>{t.name}</td><td>{t.wins}</td><td>{t.losses}</td><td>{t.pct.toFixed(3)}</td></tr>)}
        </tbody>
      </table>

      <p>Total Games Simulated: {league.gameLog.length}</p>
    </main>
  );
}

export default App;
