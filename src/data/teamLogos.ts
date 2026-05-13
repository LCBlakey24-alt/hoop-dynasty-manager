export type TeamLogoEntry = {
  teamId: string;
  fileName: string;
  path: string;
};

export const teamLogoEntries: TeamLogoEntry[] = [
  { teamId: 'birmingham-blaze', fileName: 'birmingham-blaze.png', path: '/team-logos/birmingham-blaze.png' },
  { teamId: 'brighton-waves', fileName: 'brighton-waves.png', path: '/team-logos/brighton-waves.png' },
  { teamId: 'bristol-breakers', fileName: 'bristol-breakers.png', path: '/team-logos/bristol-breakers.png' },
  { teamId: 'leeds-lightning', fileName: 'leeds-lightning.png', path: '/team-logos/leeds-lightning.png' },
  { teamId: 'leicester-foxes', fileName: 'leicester-foxes.png', path: '/team-logos/leicester-foxes.png' },
  { teamId: 'london-lionsgate', fileName: 'london-lionsgate.png', path: '/team-logos/london-lionsgate.png' },
  { teamId: 'manchester-titans', fileName: 'manchester-titans.png', path: '/team-logos/manchester-titans.png' },
  { teamId: 'newcastle-knights', fileName: 'newcastle-knights.png', path: '/team-logos/newcastle-knights.png' },
  { teamId: 'nottingham-outlaws', fileName: 'nottingham-outlaws.png', path: '/team-logos/nottingham-outlaws.png' },
  { teamId: 'sheffield-steel', fileName: 'sheffield-steel.png', path: '/team-logos/sheffield-steel.png' },
];

export const teamLogos = Object.fromEntries(
  teamLogoEntries.map((entry) => [entry.teamId, entry.path]),
) as Record<string, string>;

export function getTeamLogoPath(teamId: string) {
  return teamLogos[teamId] ?? null;
}
