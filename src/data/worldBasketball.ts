export type LeagueExpansionProfile = {
  leagueId: string;
  leagueName: string;
  country: string;
  status: 'Playable' | 'In Development' | 'Planned';
  palette: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  styleIdentity: string;
  signingModel: string;
  talentPipeline: string;
};

export const leagueExpansionProfiles: LeagueExpansionProfile[] = [
  {
    leagueId: 'bsbl',
    leagueName: 'BSBL',
    country: 'United Kingdom',
    status: 'Playable',
    palette: { primary: '#f97316', secondary: '#0b1020', tertiary: '#38bdf8' },
    styleIdentity: 'Balanced tactical styles with strong club identity variance.',
    signingModel: 'Open market contracts + internal development focus.',
    talentPipeline: 'Club development, free agents and youth progression.',
  },
  {
    leagueId: 'nabl',
    leagueName: 'NABL',
    country: 'United States',
    status: 'In Development',
    palette: { primary: '#1d4ed8', secondary: '#111827', tertiary: '#ef4444' },
    styleIdentity: 'High-athletic ceiling, star-led systems and elite depth.',
    signingModel: 'Draft-first acquisition with cap-style roster constraints.',
    talentPipeline: 'Amateur draft classes, trades and rights-based signings.',
  },
  {
    leagueId: 'ecl',
    leagueName: 'Euro Continental League',
    country: 'Europe (Multi-country)',
    status: 'In Development',
    palette: { primary: '#7c3aed', secondary: '#0f172a', tertiary: '#22c55e' },
    styleIdentity: 'Team structure, spacing and tactical discipline.',
    signingModel: 'Transfer windows + contract buyout mechanisms.',
    talentPipeline: 'Academy systems and cross-league transfers.',
  },
  {
    leagueId: 'lds',
    leagueName: 'Liga del Sol',
    country: 'South America',
    status: 'Planned',
    palette: { primary: '#ea580c', secondary: '#1f2937', tertiary: '#facc15' },
    styleIdentity: 'Creative guard play and pace swings.',
    signingModel: 'Regional transfer model with import slots.',
    talentPipeline: 'Domestic academies and regional tournaments.',
  },
];

