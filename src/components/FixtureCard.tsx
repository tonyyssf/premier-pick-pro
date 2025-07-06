
import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  teamColor?: string;
}

interface FixtureCardProps {
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

export const FixtureCard: React.FC<FixtureCardProps> = ({
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
    if (isHomeTeamDisabled && teamId === fixture.homeTeam.id) return;
    if (isAwayTeamDisabled && teamId === fixture.awayTeam.id) return;
    
    setLocalSubmitting(teamId);
    try {
      await onTeamSelect(fixture.id, teamId);
    } finally {
      setLocalSubmitting(null);
    }
  };

  const TeamOption: React.FC<{
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
        className={`
          relative border-2 rounded-lg p-4 transition-all duration-200 flex-1
          min-h-[120px] min-w-[120px] touch-manipulation transform
          ${canSelect
            ? 'border-gray-200 bg-white hover:border-plpe-purple hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
            : isDisabled
            ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-70'
            : hasStarted
            ? 'border-gray-400 bg-gray-100 cursor-not-allowed opacity-60'
            : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
          }
          ${isBeingSubmitted ? 'ring-2 ring-plpe-purple ring-opacity-50' : ''}
        `}
        onClick={canSelect ? () => handleTeamSelect(team.id) : undefined}
        disabled={!canSelect}
        aria-label={`Pick ${team.name} ${isHome ? 'home' : 'away'} team`}
      >
        {/* Usage indicator overlay */}
        {usedCount >= maxUses && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Max Used</span>
            </div>
          </div>
        )}

        {/* Match started indicator */}
        {hasStarted && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Started</span>
            </div>
          </div>
        )}

        {/* Loading spinner overlay */}
        {isBeingSubmitted && (
          <div className="absolute inset-0 bg-plpe-purple/10 rounded-lg flex items-center justify-center z-20">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
              <span className="text-xs font-medium text-plpe-purple">Submitting...</span>
            </div>
          </div>
        )}
        
        <div className="text-center relative z-10">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm shadow-lg"
            style={{ backgroundColor: team.teamColor || '#6B7280' }}
          >
            {team.shortName}
          </div>
          
          <h4 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">{team.name}</h4>
          <p className="text-xs text-gray-600 mb-3">{isHome ? 'Home' : 'Away'}</p>
          
          {/* Usage indicator dots */}
          <div className="flex justify-center space-x-1 mb-2">
            {[...Array(maxUses)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-medium text-gray-700">{usedCount}/{maxUses} used</span>
            {canSelect && (
              <span className="text-xs text-plpe-purple font-medium">Click to pick</span>
            )}
            {usedCount >= maxUses && (
              <span className="text-xs text-red-600 font-medium">Cannot pick again</span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border-2 transition-all duration-200 will-change-transform
      ${isUrgent ? 'border-yellow-300 bg-yellow-50' : hasStarted ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}
      ${submitting ? 'opacity-75' : ''}
    `}>
      {/* Header with match info and urgency indicators */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-900">
            {formatKickoffTime(fixture.kickoffTime)}
          </div>
          <div className="flex items-center space-x-2">
            {isUrgent && (
              <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                <span>Urgent</span>
              </div>
            )}
            {hasStarted ? (
              <div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                <Clock className="h-3 w-3" />
                <span>Started</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 capitalize bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {fixture.status}
              </div>
            )}
          </div>
        </div>
        
        {/* Time remaining display */}
        {hoursUntilKickoff > 0 && (
          <div className="text-xs text-gray-600">
            {hoursUntilKickoff < 1 
              ? `${Math.ceil(timeUntilKickoff / (1000 * 60))} minutes until kickoff`
              : `${Math.ceil(hoursUntilKickoff)} hours until kickoff`
            }
          </div>
        )}
      </div>

      {/* Team selection area */}
      <div className="p-4">
        <div className="flex space-x-4">
          <TeamOption
            team={fixture.homeTeam}
            isHome={true}
            usedCount={homeTeamUsedCount}
            isDisabled={isHomeTeamDisabled}
          />
          
          <div className="flex items-center justify-center px-3">
            <span className="text-gray-400 font-bold text-lg">VS</span>
          </div>
          
          <TeamOption
            team={fixture.awayTeam}
            isHome={false}
            usedCount={awayTeamUsedCount}
            isDisabled={isAwayTeamDisabled}
          />
        </div>
      </div>
    </div>
  );
};
