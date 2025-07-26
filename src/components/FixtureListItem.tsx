
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Badge } from './ui/badge';
import { TeamButton } from './TeamButton';
import { useTeamSelection } from '@/hooks/useTeamSelection';

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

export interface FixtureListItemRef {
  forceResetLoading: () => void;
}

export const FixtureListItem = forwardRef<FixtureListItemRef, FixtureListItemProps>(({
  fixture,
  homeTeamUsedCount,
  awayTeamUsedCount,
  maxUses,
  onTeamSelect,
  submitting = false,
  disabled = false
}, ref) => {
  const timeUntilKickoff = fixture.kickoffTime.getTime() - new Date().getTime();
  const hasStarted = timeUntilKickoff <= 0;
  
  const isHomeTeamDisabled = homeTeamUsedCount >= maxUses || submitting || disabled;
  const isAwayTeamDisabled = awayTeamUsedCount >= maxUses || submitting || disabled;

  const { localSubmitting, handleTeamSelect, forceResetLoading, isLoading } = useTeamSelection({
    onTeamSelect,
    fixtureId: fixture.id,
    submitting,
    disabled,
    hasStarted
  });

  // Expose forceResetLoading to parent components
  useImperativeHandle(ref, () => ({
    forceResetLoading
  }), [forceResetLoading]);

  const getContainerClass = (teamId: string, isDisabled: boolean) => {
    const teamIsLoading = isLoading(teamId);
    const canSelect = !isDisabled && !teamIsLoading && !hasStarted && !disabled;
    
    return `
      flex items-center justify-center transition-all duration-200
      ${canSelect ? 'hover:bg-gray-100' : ''}
    `;
  };

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg overflow-hidden
      ${submitting || disabled ? 'opacity-75' : ''}
    `}>
      <div className="flex h-14">
        {/* Home Team - Left Side */}
        <div className={`${getContainerClass(fixture.homeTeam.id, isHomeTeamDisabled)} flex-1 border-r border-gray-200`}>
          <TeamButton
            team={fixture.homeTeam}
            isDisabled={isHomeTeamDisabled}
            usedCount={homeTeamUsedCount}
            maxUses={maxUses}
            isLoading={isLoading(fixture.homeTeam.id)}
            onSelect={() => handleTeamSelect(fixture.homeTeam.id, isHomeTeamDisabled)}
            hasStarted={hasStarted}
            disabled={disabled}
          />
        </div>
        
        {/* Center "V" */}
        <div className="flex items-center justify-center w-8 bg-gray-50 border-r border-gray-200">
          <span className="text-sm font-semibold text-gray-600">V</span>
        </div>
        
        {/* Away Team - Right Side */}
        <div className={`${getContainerClass(fixture.awayTeam.id, isAwayTeamDisabled)} flex-1`}>
          <TeamButton
            team={fixture.awayTeam}
            isDisabled={isAwayTeamDisabled}
            usedCount={awayTeamUsedCount}
            maxUses={maxUses}
            isLoading={isLoading(fixture.awayTeam.id)}
            onSelect={() => handleTeamSelect(fixture.awayTeam.id, isAwayTeamDisabled)}
            hasStarted={hasStarted}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
});
