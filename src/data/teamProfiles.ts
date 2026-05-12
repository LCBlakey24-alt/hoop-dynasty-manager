export type CountryBasketballStyle = {
  country: 'Britain' | 'United States' | 'Europe';
  styleName: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export type TeamProfile = {
  teamId: string;
  arena: string;
  motto: string;
  fanCulture: string;
  rivalries: string[];
  localStyle: string;
  storyHooks: string[];
  countryStyle: CountryBasketballStyle;
};

export const countryStyles: Record<string, CountryBasketballStyle> = {
  britain: {
    country: 'Britain',
    styleName: 'Grit and Contact',
    summary: 'British basketball is physical, emotional and stubborn. Clubs often win through pressure, rebounding, defensive effort and hostile home crowds rather than pure polish.',
    strengths: ['Physical defence', 'Rivalry intensity', 'Rebounding battles', 'Underdog resilience'],
    weaknesses: ['Less glamorous star power', 'Streaky offence', 'Inconsistent player development pathways'],
  },
  unitedStates: {
    country: 'United States',
    styleName: 'Star Power and Pace',
    summary: 'American basketball is the apex commercial style: athletic, expressive, high scoring and driven by elite individual stars.',
    strengths: ['Elite athleticism', 'Shot creation', 'Star identity', 'Fast tempo'],
    weaknesses: ['Hero-ball risk', 'Chemistry pressure', 'Heavy media scrutiny'],
  },
  europe: {
    country: 'Europe',
    styleName: 'Fundamentals and Structure',
    summary: 'European basketball leans technical and tactical: spacing, passing, discipline, development systems and collective execution.',
    strengths: ['Tactical discipline', 'Passing systems', 'Player development', 'Spacing'],
    weaknesses: ['Can lack explosiveness', 'Less individual freedom', 'Lower pace'],
  },
};

const britishStyle = countryStyles.britain;

export const teamProfiles: Record<string, TeamProfile> = {
  'bristol-breakers': {
    teamId: 'bristol-breakers',
    arena: 'Harbour Forge Arena',
    motto: 'Break the Tide',
    fanCulture: 'Loud dockside crowds, drum-led chants and an expectation that every possession is run at full speed.',
    rivalries: ['Cardiff Dragons', 'London Lionsgate'],
    localStyle: 'Fast breaks, attacking guards and pressure after misses.',
    storyHooks: ['Can Bristol turn pace into titles?', 'The fanbase wants a new golden era after years of streaky playoff runs.'],
    countryStyle: britishStyle,
  },
  'london-lionsgate': {
    teamId: 'london-lionsgate',
    arena: 'Crown Court Garden',
    motto: 'Rule the Floor',
    fanCulture: 'High standards, celebrity nights and ruthless pressure from supporters who expect silverware.',
    rivalries: ['Bristol Breakers', 'Manchester Titans'],
    localStyle: 'Star-led half-court basketball with high-usage creators.',
    storyHooks: ['Can money and expectation become a dynasty?', 'London are loved, hated and watched by everyone.'],
    countryStyle: britishStyle,
  },
  'manchester-titans': {
    teamId: 'manchester-titans',
    arena: 'Ironworks Hall',
    motto: 'Nothing Easy',
    fanCulture: 'Hard-nosed fans who love charges, rebounds, bruising screens and ugly wins.',
    rivalries: ['London Lionsgate', 'Birmingham Blaze'],
    localStyle: 'Interior defence, rebounding and disciplined half-court control.',
    storyHooks: ['Can the Titans modernise without losing their physical identity?', 'Their best teams have always been built from the paint outward.'],
    countryStyle: britishStyle,
  },
  'birmingham-blaze': {
    teamId: 'birmingham-blaze',
    arena: 'Sparkbrook Dome',
    motto: 'Light It Up',
    fanCulture: 'Restless, noisy and addicted to scoring runs. The crowd lives for threes and momentum swings.',
    rivalries: ['Manchester Titans', 'Leicester Foxes'],
    localStyle: 'Three-point barrages and streak scoring.',
    storyHooks: ['The Blaze can beat anyone on a hot night, but can they survive cold shooting?', 'A sleeping giant with a chaotic ceiling.'],
    countryStyle: britishStyle,
  },
  'sheffield-steel': {
    teamId: 'sheffield-steel',
    arena: 'Steel Yard Centre',
    motto: 'Forged Together',
    fanCulture: 'Community-first supporters who value effort, development and defensive fundamentals.',
    rivalries: ['Leeds Lightning', 'Nottingham Outlaws'],
    localStyle: 'Balanced, gritty basketball built on discipline and role players.',
    storyHooks: ['Can a small-market culture club become more than an underdog?', 'Every great Sheffield side has been built, not bought.'],
    countryStyle: britishStyle,
  },
  'newcastle-knights': {
    teamId: 'newcastle-knights',
    arena: 'The Keep',
    motto: 'Hold the Line',
    fanCulture: 'Proud northern home support with a taste for tactical, defensive basketball.',
    rivalries: ['Glasgow Giants', 'Sheffield Steel'],
    localStyle: 'Slow pace, defensive structure and smart shot selection.',
    storyHooks: ['Can Newcastle grind their way back to title contention?', 'Their fans treat defensive stops like dunks.'],
    countryStyle: britishStyle,
  },
  'leeds-lightning': {
    teamId: 'leeds-lightning',
    arena: 'Stormhouse Arena',
    motto: 'Strike First',
    fanCulture: 'Young, loud and impatient. They want speed, dunks and prospects becoming stars.',
    rivalries: ['Sheffield Steel', 'Manchester Titans'],
    localStyle: 'Transition scoring and athletic development.',
    storyHooks: ['Can youth survive against veteran British physicality?', 'The Lightning are one breakout prospect away from becoming dangerous.'],
    countryStyle: britishStyle,
  },
  'nottingham-outlaws': {
    teamId: 'nottingham-outlaws',
    arena: 'Sherwood Hall',
    motto: 'Steal the Game',
    fanCulture: 'Chaotic, mischievous and proud of ruining bigger teams’ nights.',
    rivalries: ['Sheffield Steel', 'Leicester Foxes'],
    localStyle: 'Pressure defence, turnovers and unpredictable rotations.',
    storyHooks: ['Can chaos become a system?', 'Nobody enjoys playing Nottingham twice in a week.'],
    countryStyle: britishStyle,
  },
  'leicester-foxes': {
    teamId: 'leicester-foxes',
    arena: 'The Den',
    motto: 'Think Fast, Move Faster',
    fanCulture: 'Sharp, analytical supporters who appreciate passing, spacing and smart basketball.',
    rivalries: ['Birmingham Blaze', 'Nottingham Outlaws'],
    localStyle: 'Technical, team-first offence with playmaking bigs.',
    storyHooks: ['Can Leicester outthink more athletic teams?', 'Their best seasons come when the ball never sticks.'],
    countryStyle: britishStyle,
  },
  'brighton-waves': {
    teamId: 'brighton-waves',
    arena: 'Coastline Pavilion',
    motto: 'Ride the Run',
    fanCulture: 'Stylish coastal fanbase that loves spacing, rhythm and modern shot profiles.',
    rivalries: ['London Lionsgate', 'Bristol Breakers'],
    localStyle: 'Spacing, threes and quick ball movement.',
    storyHooks: ['Can Brighton’s modern style survive British physicality?', 'A fashionable club chasing its first real legacy.'],
    countryStyle: britishStyle,
  },
  'cardiff-dragons': {
    teamId: 'cardiff-dragons',
    arena: 'Dragonhouse',
    motto: 'Fire in the Paint',
    fanCulture: 'Fierce Welsh home support, hostile nights and huge emotional swings.',
    rivalries: ['Bristol Breakers', 'Glasgow Giants'],
    localStyle: 'Paint pressure, defensive intensity and physical guards.',
    storyHooks: ['Can Cardiff become Wales’ permanent title threat?', 'The Dragons are never quiet, even when they are losing.'],
    countryStyle: britishStyle,
  },
  'glasgow-giants': {
    teamId: 'glasgow-giants',
    arena: 'Clyde Fortress',
    motto: 'Stand Taller',
    fanCulture: 'Raucous Scottish support built around intimidation, rebounding and pride.',
    rivalries: ['Newcastle Knights', 'Cardiff Dragons'],
    localStyle: 'Post play, rim protection and punishing second-chance points.',
    storyHooks: ['Can the Giants bully their way to a modern championship?', 'Every Glasgow game feels like a fight for territory.'],
    countryStyle: britishStyle,
  },
};

export function getTeamProfile(teamId: string) {
  return teamProfiles[teamId];
}
