import type { Player } from '../types/basketball';

export type PlayerAttributes = {
  shooting: number;
  finishing: number;
  passing: number;
  ballHandling: number;
  rebounding: number;
  interiorDefence: number;
  perimeterDefence: number;
  athleticism: number;
  stamina: number;
  basketballIq: number;
  discipline: number;
  clutch: number;
};

export type AttributeKey = keyof PlayerAttributes;

const positionAdjustments: Record<Player['position'], Partial<PlayerAttributes>> = {
  PG: { passing: 8, ballHandling: 8, perimeterDefence: 3, basketballIq: 5, rebounding: -7, interiorDefence: -8 },
  SG: { shooting: 7, ballHandling: 4, finishing: 3, perimeterDefence: 3, rebounding: -4, interiorDefence: -5 },
  SF: { finishing: 4, athleticism: 4, perimeterDefence: 4, rebounding: 1 },
  PF: { rebounding: 6, interiorDefence: 5, finishing: 4, shooting: -2, ballHandling: -4 },
  C: { rebounding: 9, interiorDefence: 9, finishing: 4, passing: -4, ballHandling: -8, perimeterDefence: -4 },
};

const archetypeAdjustments: Partial<Record<Player['archetype'], Partial<PlayerAttributes>>> = {
  'Floor General': { passing: 10, ballHandling: 7, basketballIq: 9, discipline: 4 },
  Sharpshooter: { shooting: 13, clutch: 4, finishing: -3 },
  Slasher: { finishing: 10, athleticism: 8, ballHandling: 4, shooting: -3 },
  'Lockdown Defender': { perimeterDefence: 12, discipline: 6, athleticism: 3, shooting: -3 },
  'Rim Protector': { interiorDefence: 13, rebounding: 6, athleticism: 2, passing: -3 },
  'Stretch Big': { shooting: 10, rebounding: 2, interiorDefence: 2, finishing: -2 },
  'Glass Cleaner': { rebounding: 13, interiorDefence: 4, discipline: 4, shooting: -4 },
  'Two-Way Wing': { perimeterDefence: 7, finishing: 5, shooting: 4, athleticism: 4 },
  'Playmaking Big': { passing: 8, basketballIq: 7, rebounding: 4, ballHandling: 2 },
  'Sixth Man': { shooting: 4, finishing: 4, clutch: 5, discipline: -2 },
  'Veteran Leader': { basketballIq: 10, discipline: 9, clutch: 6, athleticism: -3 },
  'Raw Prospect': { potential: 0 } as never,
};

export function derivePlayerAttributes(player: Player): PlayerAttributes {
  const base = createBaseAttributes(player.overall, player.form, player.morale);

  return clampAttributes({
    ...applyAdjustments(base, positionAdjustments[player.position]),
    ...applyAdjustments(base, archetypeAdjustments[player.archetype]),
  });
}

export function getAttributeLabel(attribute: AttributeKey) {
  const labels: Record<AttributeKey, string> = {
    shooting: 'Shooting',
    finishing: 'Finishing',
    passing: 'Passing',
    ballHandling: 'Ball Handling',
    rebounding: 'Rebounding',
    interiorDefence: 'Interior Defence',
    perimeterDefence: 'Perimeter Defence',
    athleticism: 'Athleticism',
    stamina: 'Stamina',
    basketballIq: 'Basketball IQ',
    discipline: 'Discipline',
    clutch: 'Clutch',
  };

  return labels[attribute];
}

function createBaseAttributes(overall: number, form: number, morale: number): PlayerAttributes {
  const confidenceBonus = Math.round((form + morale - 140) / 10);
  const base = overall + confidenceBonus;

  return {
    shooting: base,
    finishing: base,
    passing: base,
    ballHandling: base,
    rebounding: base,
    interiorDefence: base,
    perimeterDefence: base,
    athleticism: base,
    stamina: base,
    basketballIq: base,
    discipline: base,
    clutch: base,
  };
}

function applyAdjustments(base: PlayerAttributes, adjustments: Partial<PlayerAttributes> = {}) {
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, value + (adjustments[key as AttributeKey] ?? 0)]),
  ) as PlayerAttributes;
}

function clampAttributes(attributes: PlayerAttributes): PlayerAttributes {
  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [key, Math.max(35, Math.min(99, Math.round(value)))]),
  ) as PlayerAttributes;
}
