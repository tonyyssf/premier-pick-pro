
import React, { memo, useMemo } from 'react';
import { EmptyStandings } from './EmptyStandings';
import { RealtimeStandingsHeader } from './RealtimeStandingsHeader';
import { RealtimeMobileStandingsCard } from './RealtimeMobileStandingsCard';
import { RealtimeDesktopStandingsTable } from './RealtimeDesktopStandingsTable';

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

interface OptimizedRealtimeStandingsTableProps {
  standings: Standing[];
  currentUserId?: string;
  isLoading?: boolean;
}

const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
    <span className="ml-3 text-gray-600">Loading live standings...</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export const OptimizedRealtimeStandingsTable = memo<OptimizedRealtimeStandingsTableProps>(({ 
  standings, 
  currentUserId,
  isLoading = false
}) => {
  // Memoize the display name function to prevent recreating it on every render
  const getDisplayName = useMemo(() => {
    return (standing: Standing) => {
      return standing.username || standing.name || `Player ${standing.user_id.slice(0, 8)}`;
    };
  }, []);

  // Memoize the filtered standings to prevent unnecessary recalculations
  const { validStandings, nullRankCount } = useMemo(() => {
    const valid = standings.filter(s => s.current_rank !== null);
    const nullCount = standings.length - valid.length;
    return { validStandings: valid, nullRankCount: nullCount };
  }, [standings]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (standings.length === 0) {
    return <EmptyStandings />;
  }

  return (
    <div className="overflow-x-auto will-change-scroll">
      <RealtimeStandingsHeader nullRankCount={nullRankCount} />
      
      {/* Mobile-optimized table */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {validStandings.map((standing) => {
            const isCurrentUser = currentUserId && standing.user_id === currentUserId;
            const winRate = standing.total_picks > 0 
              ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
              : '0.0';

            return (
              <RealtimeMobileStandingsCard
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
        <RealtimeDesktopStandingsTable
          standings={validStandings}
          getDisplayName={getDisplayName}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
});

OptimizedRealtimeStandingsTable.displayName = 'OptimizedRealtimeStandingsTable';
