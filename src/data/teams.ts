import type { Team } from '../types/basketball';

export const teams: Team[] = [
  {
    id: 'bristol-breakers',
    name: 'Bristol Breakers',
    city: 'Bristol',
    shortName: 'BRI',
    primaryColor: '#F97316',
    secondaryColor: '#0B1020',
    identity: 'Fast, aggressive, exciting',
    playStyle: 'Fast Break',
    reputation: 68,
    record: { wins: 0, losses: 0 },
    roster: [
      { id: 'bristol-1', name: 'Kai Mercer', age: 24, position: 'PG', archetype: 'Floor General', overall: 78, potential: 84, morale: 74, form: 70 },
      { id: 'bristol-2', name: 'Dante Vale', age: 27, position: 'SG', archetype: 'Sharpshooter', overall: 76, potential: 79, morale: 68, form: 72 },
      { id: 'bristol-3', name: 'Mason Reid', age: 22, position: 'SF', archetype: 'Two-Way Wing', overall: 73, potential: 86, morale: 82, form: 76 },
      { id: 'bristol-4', name: 'Owen Stroud', age: 29, position: 'PF', archetype: 'Glass Cleaner', overall: 74, potential: 75, morale: 71, form: 69 },
      { id: 'bristol-5', name: 'Theo Banks', age: 25, position: 'C', archetype: 'Rim Protector', overall: 77, potential: 80, morale: 77, form: 73 },
    ],
  },
  {
    id: 'london-lionsgate',
    name: 'London Lionsgate',
    city: 'London',
    shortName: 'LON',
    primaryColor: '#D4AF37',
    secondaryColor: '#4C1D95',
    identity: 'Wealthy, polished, high expectation',
    playStyle: 'Star-led Half Court',
    reputation: 82,
    record: { wins: 0, losses: 0 },
    roster: [
      { id: 'london-1', name: 'Jalen Crown', age: 28, position: 'PG', archetype: 'Floor General', overall: 84, potential: 86, morale: 80, form: 78 },
      { id: 'london-2', name: 'Elliot King', age: 26, position: 'SG', archetype: 'Sharpshooter', overall: 81, potential: 83, morale: 76, form: 75 },
      { id: 'london-3', name: 'Roman Hale', age: 30, position: 'SF', archetype: 'Veteran Leader', overall: 79, potential: 79, morale: 72, form: 71 },
      { id: 'london-4', name: 'Caleb Stone', age: 24, position: 'PF', archetype: 'Stretch Big', overall: 78, potential: 84, morale: 73, form: 74 },
      { id: 'london-5', name: 'Isaac Ward', age: 31, position: 'C', archetype: 'Rim Protector', overall: 80, potential: 80, morale: 70, form: 68 },
    ],
  },
];

export const userTeam = teams[0];
