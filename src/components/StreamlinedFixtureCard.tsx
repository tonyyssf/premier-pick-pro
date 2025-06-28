
import React from 'react';
import { Check, X } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  shortName: string;
  teamColor?: string;
}

interface StreamlinedFixtureCardProps {
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
  onTeamSelect: (fixtureId: string, teamId: string) => void;
}

export const StreamlinedFixtureCard: React.FC<StreamlinedFixtureCardProps> = ({
  fixture,
  homeTeamUsedCount,
  awayTeamUsedCount,
  maxUses,
  onTeamSelect
}) => {
  const isHomeTeamDisabled = homeTeamUsedCount >= maxUses;
  const isAwayTeamDisabled = awayTeamUsedCount >= maxUses;

  const TeamRow: React.FC<{
    team: Team;
    opponent: Team;
    venue: string;
    usedCount: number;
    isDisabled: boolean;
  }> = ({ team, opponent, venue, usedCount, isDisabled }) => (
    <button
      className={`
        w-full flex items-center justify-between p-3 rounded-lg transition-colors
        ${isDisabled 
          ? 'bg-gray-700 cursor-not-allowed opacity-50' 
          : 'bg-gray-800 hover:bg-gray-700'
        }
      `}
      onClick={!isDisabled ? () => onTeamSelect(fixture.id, team.id) : undefined}
      disabled={isDisabled}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: team.teamColor || '#6B7280' }}
        >
          {team.shortName}
        </div>
        <div className="text-left">
          <div className="text-white font-medium">{team.name}</div>
          <div className="text-gray-400 text-sm">
            vs. {opponent.name} ({venue}) 
            {usedCount > 0 && (
              <span className="ml-2 text-purple-400">×{usedCount} left</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center">
        {isDisabled ? (
          <X className="w-4 h-4 text-red-500" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-transparent" />
        )}
      </div>
    </button>
  );

  return (
    <div className="mx-4 space-y-2">
      <TeamRow
        team={fixture.homeTeam}
        opponent={fixture.awayTeam}
        venue="H"
        usedCount={maxUses - homeTeamUsedCount}
        isDisabled={isHomeTeamDisabled}
      />
      <TeamRow
        team={fixture.awayTeam}
        opponent={fixture.homeTeam}
        venue="A"
        usedCount={maxUses - awayTeamUsedCount}
        isDisabled={isAwayTeamDisabled}
      />
    </div>
  );
};
