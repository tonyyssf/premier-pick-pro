
import React from 'react';
import { EmptyStandings } from './EmptyStandings';
import { StandingsLoadingState } from './StandingsLoadingState';
import { MobileStandingsCard } from './MobileStandingsCard';
import { DesktopStandingsTable } from './DesktopStandingsTable';

interface Standing {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
  username?: string;
  name?: string;
}

interface WeeklyStandingsTableProps {
  standings: Standing[];
  currentUserId?: string;
  isLoading?: boolean;
}

export const WeeklyStandingsTable: React.FC<WeeklyStandingsTableProps> = ({ 
  standings, 
  currentUserId,
  isLoading = false
}) => {
  if (isLoading) {
    return <StandingsLoadingState />;
  }

  if (standings.length === 0) {
    return <EmptyStandings />;
  }

  const getDisplayName = (standing: Standing) => {
    return standing.username || standing.name || `Player ${standing.user_id.slice(0, 8)}`;
  };

  // Filter out standings with null ranks for display
  const validStandings = standings.filter(s => s.current_rank !== null);

  return (
    <div className="overflow-x-auto will-change-scroll">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span>Updates weekly after gameweek ends</span>
      </div>
      
      {/* Mobile-optimized cards */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {validStandings.map((standing) => {
            const isCurrentUser = currentUserId && standing.user_id === currentUserId;
            const winRate = standing.total_picks > 0 
              ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
              : '0.0';

            return (
              <MobileStandingsCard
                key={standing.id}
                standing={standing}
                isCurrentUser={!!isCurrentUser}
                displayName={getDisplayName(standing)}
                winRate={winRate}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <DesktopStandingsTable
          standings={validStandings}
          getDisplayName={getDisplayName}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};
