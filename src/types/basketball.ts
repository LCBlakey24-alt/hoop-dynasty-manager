export type Nation = 'England' | 'Wales' | 'Scotland';

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

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

export type Player = {
  id: string;
  name: string;
  age: number;
  position: Position;
  archetype: PlayerArchetype;
  overall: number;
  potential: number;
  morale: number;
  form: number;
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
  playStyle: string;
  reputation: number;
  record: {
    wins: number;
    losses: number;
  };
  roster: Player[];
};
