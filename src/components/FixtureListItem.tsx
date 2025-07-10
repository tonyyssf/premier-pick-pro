
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  const getTeamButtonClass = (team: Team, isDisabled: boolean, usedCount: number) => {
    const isBeingSubmitted = localSubmitting === team.id;
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted;
    
    return `
      flex-1 p-3 rounded-lg border-2 transition-all duration-200 text-left relative
      ${canSelect
        ? 'border-gray-200 bg-white hover:border-plpe-purple hover:shadow-md hover:scale-[1.02] cursor-pointer'
        : isDisabled
        ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-70'
        : hasStarted
        ? 'border-gray-400 bg-gray-100 cursor-not-allowed opacity-60'
        : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
      }
      ${isBeingSubmitted ? 'ring-2 ring-plpe-purple ring-opacity-50' : ''}
    `;
  };

  const TeamButton: React.FC<{
    team: Team;
    isHome: boolean;
    usedCount: number;
    isDisabled: boolean;
  }> = ({ team, isHome, usedCount, isDisabled }) => {
    const isBeingSubmitted = localSubmitting === team.id;
    const canSelect = !isDisabled && !isBeingSubmitted && !hasStarted;
    
    return (
      <button
        type="button"
        className={getTeamButtonClass(team, isDisabled, usedCount)}
        onClick={canSelect ? () => handleTeamSelect(team.id) : undefined}
        disabled={!canSelect}
        aria-label={`Pick ${team.name} ${isHome ? 'home' : 'away'} team`}
      >
        {/* Loading spinner overlay */}
        {isBeingSubmitted && (
          <div className="absolute inset-0 bg-plpe-purple/10 rounded-lg flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-plpe-purple"></div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Team color indicator */}
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: team.teamColor || '#6B7280' }}
            />
            
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{team.name}</h4>
              <p className="text-xs text-gray-600">{isHome ? 'Home' : 'Away'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Usage indicator */}
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                {[...Array(maxUses)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">{usedCount}/{maxUses}</span>
            </div>

            {/* Status badges */}
            {usedCount >= maxUses && (
              <Badge variant="destructive" className="text-xs">
                Max Used
              </Badge>
            )}
            
            {hasStarted && (
              <Badge variant="outline" className="text-xs">
                Started
              </Badge>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`
      bg-white rounded-lg border-2 p-4 transition-all duration-200
      ${isUrgent ? 'border-yellow-300 bg-yellow-50' : hasStarted ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}
      ${submitting ? 'opacity-75' : ''}
    `}>
      {/* Header with match info and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-900">
            {formatKickoffTime(fixture.kickoffTime)}
          </div>
          
          {/* Time remaining display */}
          {hoursUntilKickoff > 0 && (
            <div className="text-xs text-gray-600">
              {hoursUntilKickoff < 1 
                ? `${Math.ceil(timeUntilKickoff / (1000 * 60))} min`
                : `${Math.ceil(hoursUntilKickoff)}h`
              } until kickoff
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isUrgent && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
          
          {hasStarted ? (
            <Badge variant="outline" className="text-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              Started
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
              {fixture.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Team selection area */}
      <div className="space-y-3">
        <TeamButton
          team={fixture.homeTeam}
          isHome={true}
          usedCount={homeTeamUsedCount}
          isDisabled={isHomeTeamDisabled}
        />
        
        <div className="flex items-center justify-center">
          <span className="text-gray-400 font-bold text-sm">VS</span>
        </div>
        
        <TeamButton
          team={fixture.awayTeam}
          isHome={false}
          usedCount={awayTeamUsedCount}
          isDisabled={isAwayTeamDisabled}
        />
      </div>
    </div>
  );
};
