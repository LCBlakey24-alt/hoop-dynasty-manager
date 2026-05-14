import { useMemo, useState } from 'react';
import { getTeamLogoPath } from '../data/teamLogos';

type TeamLogoProps = {
  teamId?: string;
  teamName: string;
  size?: number;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function getFallbackGradient(seed: string) {
  const gradients = [
    'linear-gradient(135deg, rgba(249,115,22,0.95), rgba(15,23,42,0.95))',
    'linear-gradient(135deg, rgba(56,189,248,0.95), rgba(15,23,42,0.95))',
    'linear-gradient(135deg, rgba(212,175,55,0.95), rgba(76,29,149,0.95))',
    'linear-gradient(135deg, rgba(220,38,38,0.95), rgba(17,24,39,0.95))',
    'linear-gradient(135deg, rgba(20,184,166,0.95), rgba(15,23,42,0.95))',
    'linear-gradient(135deg, rgba(22,101,52,0.95), rgba(251,191,36,0.85))',
  ];
  const index = seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0) % gradients.length;

  return gradients[index];
}

export function TeamLogo({
  teamId,
  teamName,
  size = 48,
  className = '',
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoPath = teamId ? getTeamLogoPath(teamId) : null;
  const initials = useMemo(() => getInitials(teamName), [teamName]);
  const fallbackBackground = useMemo(() => getFallbackGradient(teamId ?? teamName), [teamId, teamName]);

  if (!logoPath || failed) {
    return (
      <div
        aria-label={`${teamName} crest fallback`}
        className={className}
        title={`${teamName} crest`}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(10, Math.floor(size * 0.24)),
          background: fallbackBackground,
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: Math.max(11, Math.floor(size * 0.26)),
          lineHeight: 1,
          letterSpacing: '-0.04em',
          boxShadow: 'inset 0 0 18px rgba(255,255,255,0.12), 0 10px 22px rgba(0,0,0,0.22)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={logoPath}
      alt={`${teamName} crest`}
      title={`${teamName} crest`}
      className={className}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}
