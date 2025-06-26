
import React from 'react';
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

interface RealtimeStandingsTableProps {
  standings: Standing[];
  currentUserId?: string;
  isLoading?: boolean;
}

export const RealtimeStandingsTable: React.FC<RealtimeStandingsTableProps> = ({ 
  standings, 
  currentUserId,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
        <span className="ml-3 text-gray-600">Loading live standings...</span>
      </div>
    );
  }

  if (standings.length === 0) {
    return <EmptyStandings />;
  }

  const getDisplayName = (standing: Standing) => {
    return standing.username || standing.name || `Player ${standing.user_id.slice(0, 8)}`;
  };

  // Filter out standings with null ranks and show a warning
  const validStandings = standings.filter(s => s.current_rank !== null);
  const nullRankCount = standings.length - validStandings.length;

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
};
