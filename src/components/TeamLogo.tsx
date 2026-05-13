import { useState } from 'react';
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

export function TeamLogo({
  teamId,
  teamName,
  size = 48,
  className = '',
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);

  const logoPath = teamId ? getTeamLogoPath(teamId) : null;

  if (!logoPath || failed) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: Math.max(12, Math.floor(size * 0.28)),
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {getInitials(teamName)}
      </div>
    );
  }

  return (
    <img
      src={logoPath}
      alt={teamName}
      title={teamName}
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
