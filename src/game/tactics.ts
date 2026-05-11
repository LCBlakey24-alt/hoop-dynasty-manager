export type Pace = 'Slow' | 'Balanced' | 'Fast';
export type OffensiveFocus = 'Inside' | 'Balanced' | 'Three-Point Heavy' | 'Transition';
export type DefensiveStyle = 'Man-to-Man' | 'Zone' | 'Press';
export type ReboundingFocus = 'Get Back' | 'Balanced' | 'Crash Boards';
export type UsageFocus = 'Balanced' | 'Star Player' | 'Guards' | 'Bigs';

export type TacticalSettings = {
  pace: Pace;
  offensiveFocus: OffensiveFocus;
  defensiveStyle: DefensiveStyle;
  reboundingFocus: ReboundingFocus;
  usageFocus: UsageFocus;
};

export const defaultTactics: TacticalSettings = {
  pace: 'Fast',
  offensiveFocus: 'Transition',
  defensiveStyle: 'Man-to-Man',
  reboundingFocus: 'Balanced',
  usageFocus: 'Balanced',
};

export const tacticOptions = {
  pace: ['Slow', 'Balanced', 'Fast'] as Pace[],
  offensiveFocus: ['Inside', 'Balanced', 'Three-Point Heavy', 'Transition'] as OffensiveFocus[],
  defensiveStyle: ['Man-to-Man', 'Zone', 'Press'] as DefensiveStyle[],
  reboundingFocus: ['Get Back', 'Balanced', 'Crash Boards'] as ReboundingFocus[],
  usageFocus: ['Balanced', 'Star Player', 'Guards', 'Bigs'] as UsageFocus[],
};
