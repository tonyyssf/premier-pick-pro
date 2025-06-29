
import React from 'react';
import { MobileTeamCard } from './MobileTeamCard';

interface Team {
  id: string;
  name: string;
  shortName: string;
  teamColor?: string;
}

interface MobileFixtureCardProps {
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

export const MobileFixtureCard: React.FC<MobileFixtureCardProps> = ({
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 will-change-transform">
      {/* Match info header */}
      <div className="text-center mb-6">
        <div className="text-base font-semibold text-gray-800 mb-2">
          {formatKickoffTime(fixture.kickoffTime)}
        </div>
        <div className="text-sm text-gray-500 capitalize bg-gray-50 px-3 py-1 rounded-full inline-block">
          {fixture.status}
        </div>
      </div>

      {/* Teams selection */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <MobileTeamCard
          team={fixture.homeTeam}
          isHome={true}
          usedCount={homeTeamUsedCount}
          maxUses={maxUses}
          isDisabled={isHomeTeamDisabled}
          onSelect={() => onTeamSelect(fixture.id, fixture.homeTeam.id)}
          isSubmitting={submitting}
        />
        
        <div className="flex items-center justify-center py-4 sm:py-0">
          <div className="bg-gradient-to-r from-plpe-purple to-plpe-blue text-white font-bold text-lg px-4 py-2 rounded-full shadow-md">
            VS
          </div>
        </div>
        
        <MobileTeamCard
          team={fixture.awayTeam}
          isHome={false}
          usedCount={awayTeamUsedCount}
          maxUses={maxUses}
          isDisabled={isAwayTeamDisabled}
          onSelect={() => onTeamSelect(fixture.id, fixture.awayTeam.id)}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
};
