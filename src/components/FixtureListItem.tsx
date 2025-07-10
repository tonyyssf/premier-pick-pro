
import React, { useState } from 'react';
import { Badge } from './ui/badge';

interface Team {
  id: string;
  name: string;
  shortName: string;
  teamColor?: string;
}

interface FixtureListItemProps {
  fixture: {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    kickoffTime: Date;
    status: string;
  };
  homeTeamUsedCount: number;
  awayTeamUsedCount: number;
  maxUses: number;
  selectedTeam: string | null;
  onTeamSelect: (fixtureId: string, teamId: string) => void;
  submitting?: boolean;
  disabled?: boolean;
}

export const FixtureListItem: React.FC<FixtureListItemProps> = ({
  fixture,
  homeTeamUsedCount,
  awayTeamUsedCount,
  maxUses,
  onTeamSelect,
  submitting = false,
  disabled = false
}) => {
  const [localSubmitting, setLocalSubmitting] = useState<string | null>(null);
  
  const isHomeTeamDisabled = homeTeamUsedCount >= maxUses || submitting || disabled;
  const isAwayTeamDisabled = awayTeamUsedCount >= maxUses || submitting || disabled;
  
  const timeUntilKickoff = fixture.kickoffTime.getTime() - new Date().getTime();
  const hasStarted = timeUntilKickoff <= 0;

  const handleTeamSelect = async (teamId: string) => {
    if ((isHomeTeamDisabled && teamId === fixture.homeTeam.id) ||
        (isAwayTeamDisabled && teamId === fixture.awayTeam.id) ||
        hasStarted ||
        disabled) {
      return;
    }
    
    setLocalSubmitting(teamId);
    try {
      await onTeamSelect(fixture.id, teamId);
    } finally {
      setLocalSubmitting(null);
    }
  };

  const getTeamButtonClass = (teamId: string, isDisabled: boolean) => {
    const isBeingSubmitted = localSubmitting === teamId;
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted && !disabled;
    
    return `
      flex items-center justify-center space-x-1 p-2 h-full transition-all duration-200 relative
      ${canSelect
        ? 'cursor-pointer'
        : 'cursor-not-allowed opacity-60'
      }
      ${isBeingSubmitted ? 'ring-1 ring-plpe-purple ring-opacity-50' : ''}
    `;
  };

  const getContainerClass = (teamId: string, isDisabled: boolean) => {
    const isBeingSubmitted = localSubmitting === teamId;
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted && !disabled;
    
    return `
      flex items-center justify-center transition-all duration-200
      ${canSelect ? 'hover:bg-gray-100' : ''}
    `;
  };

  const TeamButton: React.FC<{
    team: Team;
    isDisabled: boolean;
    usedCount: number;
  }> = ({ team, isDisabled, usedCount }) => {
    const isBeingSubmitted = localSubmitting === team.id;
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted && !disabled;
    
    return (
      <button
        type="button"
        className={getTeamButtonClass(team.id, isDisabled)}
        onClick={canSelect ? () => handleTeamSelect(team.id) : undefined}
        disabled={!canSelect}
        aria-label={`Pick ${team.name}`}
      >
        {/* Loading spinner overlay */}
        {isBeingSubmitted && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-plpe-purple"></div>
          </div>
        )}

        {/* Team color indicator - smaller */}
        <div 
          className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: team.teamColor || '#6B7280' }}
        />
        
        {/* Team name - show full name on desktop/tablet, short name on mobile */}
        <span className="font-medium text-gray-900 text-xs leading-tight truncate">
          <span className="hidden md:inline">{team.name}</span>
          <span className="md:hidden">{team.shortName}</span>
        </span>
        
        {/* Usage dots - smaller and only show on larger screens */}
        <div className="hidden sm:flex space-x-0.5">
          {[...Array(maxUses)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Usage count - show on mobile instead of dots */}
        <span className="text-xs text-gray-600 sm:hidden">
          {usedCount}/{maxUses}
        </span>
      </button>
    );
  };

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg overflow-hidden
      ${submitting || disabled ? 'opacity-75' : ''}
    `}>
      <div className="grid grid-cols-2 h-14">
        {/* Home Team - Left Half */}
        <div className={`${getContainerClass(fixture.homeTeam.id, isHomeTeamDisabled)} border-r border-gray-200`}>
          <TeamButton
            team={fixture.homeTeam}
            isDisabled={isHomeTeamDisabled}
            usedCount={homeTeamUsedCount}
          />
        </div>
        
        {/* Away Team - Right Half */}
        <div className={getContainerClass(fixture.awayTeam.id, isAwayTeamDisabled)}>
          <TeamButton
            team={fixture.awayTeam}
            isDisabled={isAwayTeamDisabled}
            usedCount={awayTeamUsedCount}
          />
        </div>
      </div>
    </div>
  );
};
