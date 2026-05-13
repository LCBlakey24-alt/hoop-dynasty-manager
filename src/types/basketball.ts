export type Nation = 'England' | 'Wales' | 'Scotland';

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type PlayerRole = 'Starter' | 'Rotation' | 'Depth' | 'Prospect';

export type PlayerArchetype =
  | 'Floor General'
  | 'Sharpshooter'
  | 'Slasher'
  | 'Lockdown Defender'
  | 'Rim Protector'
  | 'Stretch Big'
  | 'Glass Cleaner'
  | 'Two-Way Wing'
  | 'Playmaking Big'
  | 'Sixth Man'
  | 'Veteran Leader'
  | 'Raw Prospect';

export type InjurySeverity = 'Knock' | 'Minor' | 'Major';

export type PlayerInjury = {
  type: string;
  severity: InjurySeverity;
  gamesRemaining: number;
};

export type Player = {
  id: string;
  name: string;
  age: number;
  position: Position;
  role: PlayerRole;
  archetype: PlayerArchetype;
  overall: number;
  potential: number;
  morale: number;
  form: number;
  fatigue?: number;
  injury?: PlayerInjury | null;
  developmentProgress?: number;
};

export type Team = {
  id: string;
  name: string;
  nation: Nation;
  city: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  identity: string;
  foundedYear: number;
  championships: number;
  historicPlayers: string[];
  legacyStory: string;
  playStyle: string;
  reputation: number;
  record: {
    wins: number;
    losses: number;
  };
  roster: Player[];
};

export type Fixture = {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
};

export type Standing = {
  teamId: string;
  teamName: string;
  shortName: string;
  nation: Nation;
  primaryColor: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  winPercentage: number;
};

export type RotationEntry = {
  playerId: string;
  minutes: number;
  isStarter: boolean;
  benchOrder: number;
};

export type RotationPlan = RotationEntry[];

export type PlayerConditionChange = {
  playerId: string;
  playerName: string;
  minutes: number;
  fatigueChange: number;
  formChange: number;
  moraleChange: number;
  nextFatigue: number;
  nextForm: number;
  nextMorale: number;
  injury?: PlayerInjury | null;
  note: string;
};

export type PlayerDevelopmentChange = {
  playerId: string;
  playerName: string;
  minutes: number;
  progressGain: number;
  nextProgress: number;
  overallBefore: number;
  overallAfter: number;
  potential: number;
  note: string;
};
