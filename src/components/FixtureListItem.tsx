
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
}

export const FixtureListItem: React.FC<FixtureListItemProps> = ({
  fixture,
  homeTeamUsedCount,
  awayTeamUsedCount,
  maxUses,
  onTeamSelect,
  submitting = false
}) => {
  const [localSubmitting, setLocalSubmitting] = useState<string | null>(null);
  
  const isHomeTeamDisabled = homeTeamUsedCount >= maxUses || submitting;
  const isAwayTeamDisabled = awayTeamUsedCount >= maxUses || submitting;
  
  const timeUntilKickoff = fixture.kickoffTime.getTime() - new Date().getTime();
  const hasStarted = timeUntilKickoff <= 0;

  const handleTeamSelect = async (teamId: string) => {
    if ((isHomeTeamDisabled && teamId === fixture.homeTeam.id) ||
        (isAwayTeamDisabled && teamId === fixture.awayTeam.id) ||
        hasStarted) {
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
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted;
    
    return `
      flex flex-col items-center justify-center space-y-1 sm:space-y-2 p-3 sm:p-4 h-full transition-all duration-200 relative
      ${canSelect
        ? 'hover:bg-gray-100 cursor-pointer'
        : 'cursor-not-allowed opacity-60'
      }
      ${isBeingSubmitted ? 'ring-2 ring-plpe-purple ring-opacity-50' : ''}
    `;
  };

  const TeamButton: React.FC<{
    team: Team;
    isDisabled: boolean;
    usedCount: number;
  }> = ({ team, isDisabled, usedCount }) => {
    const isBeingSubmitted = localSubmitting === team.id;
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted;
    
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
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-plpe-purple"></div>
          </div>
        )}

        {/* Team color indicator */}
        <div 
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: team.teamColor || '#6B7280' }}
        />
        
        {/* Team name */}
        <h4 className="font-medium text-gray-900 text-sm sm:text-base text-center leading-tight">{team.name}</h4>
        
        {/* Usage indicator */}
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            {[...Array(maxUses)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                  i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-600 ml-1">
            {usedCount}/{maxUses}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg overflow-hidden
      ${submitting ? 'opacity-75' : ''}
    `}>
      <div className="grid grid-cols-2 min-h-[100px] sm:min-h-[120px]">
        {/* Home Team - Left Half */}
        <div className="flex items-center justify-center border-r border-gray-200">
          <TeamButton
            team={fixture.homeTeam}
            isDisabled={isHomeTeamDisabled}
            usedCount={homeTeamUsedCount}
          />
        </div>
        
        {/* Away Team - Right Half */}
        <div className="flex items-center justify-center">
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
