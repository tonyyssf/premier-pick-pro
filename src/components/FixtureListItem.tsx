
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
      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative
      ${canSelect
        ? 'hover:bg-plpe-purple/10 cursor-pointer'
        : 'cursor-not-allowed opacity-60'
      }
      ${isBeingSubmitted ? 'ring-2 ring-plpe-purple ring-opacity-50' : ''}
    `;
  };

  const TeamButton: React.FC<{
    team: Team;
    isDisabled: boolean;
    side: 'left' | 'right';
  }> = ({ team, isDisabled, side }) => {
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
          <div className="absolute inset-0 bg-plpe-purple/10 rounded-lg flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-plpe-purple"></div>
          </div>
        )}

        <div className={`flex items-center space-x-3 ${side === 'right' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Team color indicator */}
          <div 
            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: team.teamColor || '#6B7280' }}
          />
          
          <div className={`${side === 'right' ? 'text-right' : 'text-left'}`}>
            <h4 className="font-semibold text-gray-900 text-base">{team.name}</h4>
            
            {/* Usage indicator */}
            <div className="flex items-center space-x-1 mt-1">
              <div className="flex space-x-1">
                {[...Array(maxUses)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < (team.id === fixture.homeTeam.id ? homeTeamUsedCount : awayTeamUsedCount) 
                        ? 'bg-plpe-purple' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">
                {team.id === fixture.homeTeam.id ? homeTeamUsedCount : awayTeamUsedCount}/{maxUses}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`
      bg-plpe-gradient rounded-lg p-4 mb-4
      ${submitting ? 'opacity-75' : ''}
    `}>
      <div className="flex items-center justify-between text-white">
        {/* Home Team */}
        <div className="flex-1">
          <TeamButton
            team={fixture.homeTeam}
            isDisabled={isHomeTeamDisabled}
            side="left"
          />
        </div>
        
        {/* Kickoff Time */}
        <div className="flex-shrink-0 px-8 text-center">
          <div className="text-2xl font-bold">
            {formatKickoffTime(fixture.kickoffTime)}
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center justify-center space-x-2 mt-2">
            {isUrgent && (
              <Badge variant="outline" className="text-yellow-300 border-yellow-300 bg-yellow-900/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
            
            {hasStarted ? (
              <Badge variant="outline" className="text-gray-300 border-gray-300 bg-gray-900/20">
                <Clock className="h-3 w-3 mr-1" />
                Started
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-300 border-green-300 bg-green-900/20">
                {fixture.status}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Away Team */}
        <div className="flex-1">
          <TeamButton
            team={fixture.awayTeam}
            isDisabled={isAwayTeamDisabled}
            side="right"
          />
        </div>
      </div>
    </div>
  );
};
