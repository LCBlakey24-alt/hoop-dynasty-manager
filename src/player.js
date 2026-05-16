export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

const FIRST_NAMES = ['Jay', 'Liam', 'Noah', 'Mason', 'Aiden', 'Kai', 'Evan', 'Drew', 'Nico', 'Owen'];
const LAST_NAMES = ['Carter', 'Brooks', 'Reed', 'Turner', 'Hayes', 'Morris', 'Powell', 'Ward', 'Coleman', 'Foster'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomName() {
  return `${FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)]}`;
}

/** Create one player with baseline season stats. */
export function createPlayer(teamId, index) {
  const age = randomInt(19, 35);
  const overall = randomInt(60, 92);
  const salary = randomInt(1, 25) * 100000;
  const years = randomInt(1, 4);
  const position = POSITIONS[index % POSITIONS.length];

  return {
    id: `${teamId}-p-${index + 1}`,
    teamId,
    name: randomName(),
    position,
    age,
    overall,
    contract: `$${(salary / 1000000).toFixed(1)}M x ${years}y`,
    lineupSlot: index < 5 ? 'Starter' : 'Bench',
    season: { games: 0, points: 0, rebounds: 0, assists: 0, turnovers: 0 },
  };
}

/** Generate a full roster for a team. */
export function createRoster(teamId, size = 10) {
  return Array.from({ length: size }, (_, idx) => createPlayer(teamId, idx));
}
