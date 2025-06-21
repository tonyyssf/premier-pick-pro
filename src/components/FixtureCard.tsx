
import React from 'react';

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
  const isHomeTeamDisabled = homeTeamUsedCount >= maxUses || submitting;
  const isAwayTeamDisabled = awayTeamUsedCount >= maxUses || submitting;

  const formatKickoffTime = (date: Date) => {
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TeamOption: React.FC<{
    team: Team;
    isHome: boolean;
    usedCount: number;
    isDisabled: boolean;
  }> = ({ team, isHome, usedCount, isDisabled }) => (
    <button
      type="button"
      className={`
        relative border-2 rounded-lg p-4 transition-all duration-200 flex-1
        min-h-[48px] min-w-[48px] touch-manipulation
        ${isDisabled
          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
          : 'border-gray-200 bg-white hover:border-plpe-purple hover:shadow-md active:scale-95'
        }
        ${submitting ? 'animate-pulse' : ''}
      `}
      onClick={!isDisabled ? () => onTeamSelect(fixture.id, team.id) : undefined}
      disabled={isDisabled}
      aria-label={`Pick ${team.name} ${isHome ? 'home' : 'away'} team`}
    >
      {usedCount >= maxUses && (
        <div className="absolute inset-0 bg-gray-900/20 rounded-lg flex items-center justify-center">
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Used {maxUses}/{maxUses}
          </span>
        </div>
      )}

      {submitting && (
        <div className="absolute inset-0 bg-plpe-purple/10 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-plpe-purple"></div>
        </div>
      )}
      
      <div className="text-center">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm shadow-sm"
          style={{ backgroundColor: team.teamColor || '#6B7280' }}
        >
          {team.shortName}
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{team.name}</h4>
        <p className="text-xs text-gray-600">{isHome ? 'Home' : 'Away'}</p>
        
        <div className="flex justify-center space-x-1 mt-2">
          {[...Array(maxUses)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < usedCount ? 'bg-plpe-purple' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{usedCount}/{maxUses} used</span>
      </div>
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border will-change-transform">
      <div className="text-center mb-4">
        <div className="text-sm text-gray-600 mb-1">
          {formatKickoffTime(fixture.kickoffTime)}
        </div>
        <div className="text-xs text-gray-500 capitalize">
          Status: {fixture.status}
        </div>
      </div>

      <div className="flex space-x-3">
        <TeamOption
          team={fixture.homeTeam}
          isHome={true}
          usedCount={homeTeamUsedCount}
          isDisabled={isHomeTeamDisabled}
        />
        
        <div className="flex items-center justify-center px-2">
          <span className="text-gray-400 font-bold">VS</span>
        </div>
        
        <TeamOption
          team={fixture.awayTeam}
          isHome={false}
          usedCount={awayTeamUsedCount}
          isDisabled={isAwayTeamDisabled}
        />
      </div>
    </div>
  );
};
