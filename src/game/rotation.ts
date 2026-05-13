import type { Player, Position, RotationPlan, Team } from '../types/basketball';

export const TARGET_TEAM_MINUTES = 200;
export const STARTER_COUNT = 5;

const starterMinutesByPosition: Record<Position, number> = {
  PG: 32,
  SG: 31,
  SF: 31,
  PF: 30,
  C: 30,
};

const roleFallbackMinutes: Record<Player['role'], number> = {
  Starter: 30,
  Rotation: 18,
  Depth: 7,
  Prospect: 4,
};

export function createDefaultRotation(team: Team): RotationPlan {
  const starters = chooseDefaultStarters(team.roster);
  const starterIds = new Set(starters.map((player) => player.id));
  let benchOrder = 1;

  return team.roster.map((player) => {
    const isStarter = starterIds.has(player.id);
    const minutes = isStarter
      ? starterMinutesByPosition[player.position]
      : roleFallbackMinutes[player.role];

    return {
      playerId: player.id,
      minutes,
      isStarter,
      benchOrder: isStarter ? 0 : benchOrder++,
    };
  });
}

export function normaliseRotation(team: Team, rotation?: RotationPlan | null): RotationPlan {
  const fallback = createDefaultRotation(team);

  if (!rotation?.length) return fallback;

  const existingEntries = new Map(rotation.map((entry) => [entry.playerId, entry]));
  let benchOrder = 1;

  const merged = team.roster.map((player) => {
    const existing = existingEntries.get(player.id);
    const fallbackEntry = fallback.find((entry) => entry.playerId === player.id)!;
    const isStarter = existing?.isStarter ?? fallbackEntry.isStarter;

    return {
      playerId: player.id,
      isStarter,
      minutes: clampMinutes(existing?.minutes ?? fallbackEntry.minutes),
      benchOrder: isStarter ? 0 : existing?.benchOrder ?? benchOrder++,
    };
  });

  return rebalanceStarterCount(team, merged);
}

export function updateRotationStarter(team: Team, rotation: RotationPlan, playerId: string, shouldStart: boolean): RotationPlan {
  const normalised = normaliseRotation(team, rotation);
  const currentEntry = normalised.find((entry) => entry.playerId === playerId);

  if (!currentEntry) return normalised;

  const starters = normalised.filter((entry) => entry.isStarter);

  if (shouldStart && starters.length >= STARTER_COUNT) {
    const lowestStarter = starters
      .filter((entry) => entry.playerId !== playerId)
      .sort((a, b) => getPlayer(team, a.playerId).overall - getPlayer(team, b.playerId).overall)[0];

    return normaliseRotation(team, normalised.map((entry) => {
      if (entry.playerId === playerId) return { ...entry, isStarter: true, minutes: Math.max(entry.minutes, 28), benchOrder: 0 };
      if (entry.playerId === lowestStarter?.playerId) return { ...entry, isStarter: false, minutes: Math.min(entry.minutes, 20), benchOrder: STARTER_COUNT + 1 };
      return entry;
    }));
  }

  if (!shouldStart && starters.length <= STARTER_COUNT) {
    return normalised;
  }

  return normaliseRotation(team, normalised.map((entry) => (
    entry.playerId === playerId
      ? { ...entry, isStarter: shouldStart, minutes: shouldStart ? Math.max(entry.minutes, 28) : Math.min(entry.minutes, 18) }
      : entry
  )));
}

export function updateRotationMinutes(team: Team, rotation: RotationPlan, playerId: string, minutes: number): RotationPlan {
  return normaliseRotation(team, rotation).map((entry) => (
    entry.playerId === playerId ? { ...entry, minutes: clampMinutes(minutes) } : entry
  ));
}

export function getRotationEntry(rotation: RotationPlan, playerId: string) {
  return rotation.find((entry) => entry.playerId === playerId);
}

export function getSortedRotationPlayers(team: Team, rotation: RotationPlan) {
  const entries = normaliseRotation(team, rotation);

  return [...team.roster].sort((a, b) => {
    const entryA = getRotationEntry(entries, a.id);
    const entryB = getRotationEntry(entries, b.id);

    if (entryA?.isStarter !== entryB?.isStarter) return entryA?.isStarter ? -1 : 1;
    if ((entryA?.benchOrder ?? 99) !== (entryB?.benchOrder ?? 99)) return (entryA?.benchOrder ?? 99) - (entryB?.benchOrder ?? 99);
    return b.overall - a.overall;
  });
}

export function getRotationWarnings(team: Team, rotation: RotationPlan): string[] {
  const entries = normaliseRotation(team, rotation);
  const starters = entries.filter((entry) => entry.isStarter);
  const starterPlayers = starters.map((entry) => getPlayer(team, entry.playerId));
  const totalMinutes = getTotalRotationMinutes(entries);
  const warnings: string[] = [];

  if (starters.length !== STARTER_COUNT) warnings.push(`You need exactly ${STARTER_COUNT} starters.`);
  if (Math.abs(totalMinutes - TARGET_TEAM_MINUTES) > 8) warnings.push(`Expected minutes should be close to ${TARGET_TEAM_MINUTES}. Current total: ${totalMinutes}.`);
  if (!starterPlayers.some((player) => player.position === 'PG')) warnings.push('Starting five has no point guard.');
  if (!starterPlayers.some((player) => player.position === 'C')) warnings.push('Starting five has no centre.');
  if (entries.some((entry) => entry.minutes > 38)) warnings.push('One or more players are above 38 minutes and may fatigue quickly.');
  if (entries.filter((entry) => entry.minutes > 0).length < 8) warnings.push('Rotation is very short. Consider using at least 8 players.');

  return warnings;
}

export function getTotalRotationMinutes(rotation: RotationPlan) {
  return rotation.reduce((total, entry) => total + entry.minutes, 0);
}

function chooseDefaultStarters(players: Player[]) {
  const startersByPosition = (['PG', 'SG', 'SF', 'PF', 'C'] as Position[])
    .map((position) => players
      .filter((player) => player.position === position)
      .sort((a, b) => b.overall - a.overall)[0])
    .filter(Boolean) as Player[];

  if (startersByPosition.length >= STARTER_COUNT) return startersByPosition.slice(0, STARTER_COUNT);

  const selectedIds = new Set(startersByPosition.map((player) => player.id));
  const bestRemaining = players
    .filter((player) => !selectedIds.has(player.id))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, STARTER_COUNT - startersByPosition.length);

  return [...startersByPosition, ...bestRemaining];
}

function rebalanceStarterCount(team: Team, rotation: RotationPlan) {
  const starters = rotation.filter((entry) => entry.isStarter);

  if (starters.length === STARTER_COUNT) return rotation;

  if (starters.length > STARTER_COUNT) {
    const startersToKeep = new Set(starters
      .sort((a, b) => getPlayer(team, b.playerId).overall - getPlayer(team, a.playerId).overall)
      .slice(0, STARTER_COUNT)
      .map((entry) => entry.playerId));

    return rotation.map((entry) => ({
      ...entry,
      isStarter: startersToKeep.has(entry.playerId),
      benchOrder: startersToKeep.has(entry.playerId) ? 0 : entry.benchOrder || STARTER_COUNT + 1,
    }));
  }

  const starterIds = new Set(starters.map((entry) => entry.playerId));
  const promote = rotation
    .filter((entry) => !starterIds.has(entry.playerId))
    .sort((a, b) => getPlayer(team, b.playerId).overall - getPlayer(team, a.playerId).overall)
    .slice(0, STARTER_COUNT - starters.length)
    .map((entry) => entry.playerId);
  const promoteIds = new Set(promote);

  return rotation.map((entry) => ({
    ...entry,
    isStarter: entry.isStarter || promoteIds.has(entry.playerId),
    benchOrder: entry.isStarter || promoteIds.has(entry.playerId) ? 0 : entry.benchOrder,
    minutes: entry.isStarter || promoteIds.has(entry.playerId) ? Math.max(entry.minutes, 28) : entry.minutes,
  }));
}

function getPlayer(team: Team, playerId: string) {
  const player = team.roster.find((candidate) => candidate.id === playerId);

  if (!player) throw new Error(`Player not found: ${playerId}`);

  return player;
}

function clampMinutes(minutes: number) {
  if (!Number.isFinite(minutes)) return 0;

  return Math.max(0, Math.min(48, Math.round(minutes)));
}
