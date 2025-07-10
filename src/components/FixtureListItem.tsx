
import React, { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
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
  const hoursUntilKickoff = timeUntilKickoff / (1000 * 60 * 60);
  const isUrgent = hoursUntilKickoff <= 2 && hoursUntilKickoff > 0;
  const hasStarted = timeUntilKickoff <= 0;

  const formatKickoffTime = (date: Date) => {
    return date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      flex flex-col items-center justify-center space-y-1 sm:space-y-2 p-2 sm:p-3 h-full transition-all duration-200 relative
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
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: team.teamColor || '#6B7280' }}
        />
        
        {/* Team name - responsive text size */}
        <h4 className="font-medium text-gray-900 text-xs sm:text-sm text-center leading-tight">{team.name}</h4>
        
        {/* Usage indicator - smaller and more compact */}
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          <div className="flex space-x-0.5">
            {[...Array(maxUses)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-0.5 sm:ml-1">
            {usedCount}/{maxUses}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg mb-2 sm:mb-3 overflow-hidden
      ${submitting ? 'opacity-75' : ''}
    `}>
      <div className="grid grid-cols-3 min-h-[80px] sm:min-h-[90px]">
        {/* Home Team - Left Third */}
        <div className="flex items-center justify-center border-r border-gray-200">
          <TeamButton
            team={fixture.homeTeam}
            isDisabled={isHomeTeamDisabled}
            usedCount={homeTeamUsedCount}
          />
        </div>
        
        {/* Kickoff Time - Center Third */}
        <div className="flex flex-col items-center justify-center space-y-1 p-2 sm:p-3 border-r border-gray-200">
          <div className="text-lg sm:text-xl font-bold text-gray-900">
            {formatKickoffTime(fixture.kickoffTime)}
          </div>
          
          {/* Status indicators - smaller badges */}
          <div className="flex flex-col items-center space-y-0.5">
            {isUrgent && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs px-1.5 py-0.5">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                <span className="hidden sm:inline">Urgent</span>
                <span className="sm:hidden">!</span>
              </Badge>
            )}
            
            {hasStarted ? (
              <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-50 text-xs px-1.5 py-0.5">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                <span className="hidden sm:inline">Started</span>
                <span className="sm:hidden">Live</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-xs px-1.5 py-0.5">
                <span className="hidden sm:inline">{fixture.status}</span>
                <span className="sm:hidden">Open</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Away Team - Right Third */}
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
