export type CareerStage =
  | 'Youth Academy'
  | 'High School'
  | 'College/University'
  | "Women's Pro"
  | "Men's Pro"
  | 'National Team';

export type CareerTrack = {
  id: string;
  title: string;
  perspective: 'Manager' | 'Player';
  summary: string;
  entryStage: CareerStage;
  endGoal: string;
  stages: Array<{
    stage: CareerStage;
    focus: string;
    progressionSignals: string[];
  }>;
};

export type LeaguePathwayRule = {
  leagueId: string;
  allowsYouthAcademy: boolean;
  allowsCollegeDraft: boolean;
  allowsInterLeagueTransfers: boolean;
  womenPipelineEnabled: boolean;
  notes: string;
};

export const careerTracks: CareerTrack[] = [
  {
    id: 'manager-journeyman',
    title: 'Manager Career Journey',
    perspective: 'Manager',
    summary: 'Build your reputation from youth coaching through global pro leagues.',
    entryStage: 'Youth Academy',
    endGoal: 'Win top-flight titles across multiple countries.',
    stages: [
      {
        stage: 'Youth Academy',
        focus: 'Player growth, habits, fundamentals and school-club relationships.',
        progressionSignals: ['Development efficiency', 'Youth promotions', 'Culture rating'],
      },
      {
        stage: 'High School',
        focus: 'Tournament performance, scout visibility and recruitment reputation.',
        progressionSignals: ['Win rate', 'Prospect pipeline', 'Scout interest'],
      },
      {
        stage: 'College/University',
        focus: 'System identity, draft-stock development and national exposure.',
        progressionSignals: ['Conference finish', 'Drafted players', 'Program prestige'],
      },
      {
        stage: "Women's Pro",
        focus: 'Professional roster balancing, contracts and tactical adaptation.',
        progressionSignals: ['Playoff consistency', 'Retention success', 'Club reputation'],
      },
      {
        stage: "Men's Pro",
        focus: 'Elite competition, cap/draft rules and cross-border career moves.',
        progressionSignals: ['Championship contention', 'Board confidence', 'Legacy score'],
      },
    ],
  },
  {
    id: 'player-odyssey',
    title: 'Player Career Odyssey',
    perspective: 'Player',
    summary: 'Start as a prospect, grow your skillset and chase global stardom.',
    entryStage: 'High School',
    endGoal: 'Become an international franchise player and national team icon.',
    stages: [
      {
        stage: 'High School',
        focus: 'Core skill growth, role definition and scholarship pathways.',
        progressionSignals: ['Skill grade', 'Coach trust', 'Recruit rank'],
      },
      {
        stage: 'College/University',
        focus: 'Draft board rise, minute earning and physical development.',
        progressionSignals: ['Draft projection', 'Efficiency ratings', 'Team impact'],
      },
      {
        stage: "Women's Pro",
        focus: 'Pro transition path (when applicable by profile and league).',
        progressionSignals: ['Role security', 'Contract offers', 'League adaptation'],
      },
      {
        stage: "Men's Pro",
        focus: 'Peak years, contract decisions and inter-country transfer choices.',
        progressionSignals: ['All-star status', 'Awards', 'Transfer leverage'],
      },
      {
        stage: 'National Team',
        focus: 'International tournaments and all-time legacy building.',
        progressionSignals: ['Selection status', 'International medals', 'Legacy impact'],
      },
    ],
  },
];

export const pathwayRulesByLeague: LeaguePathwayRule[] = [
  {
    leagueId: 'bsbl',
    allowsYouthAcademy: true,
    allowsCollegeDraft: false,
    allowsInterLeagueTransfers: true,
    womenPipelineEnabled: true,
    notes: 'Club academy pathway and open-market progression model.',
  },
  {
    leagueId: 'nabl',
    allowsYouthAcademy: true,
    allowsCollegeDraft: true,
    allowsInterLeagueTransfers: true,
    womenPipelineEnabled: true,
    notes: 'Draft-first roster entry with rights and structured signing rules.',
  },
];

