
import React from 'react';
import { RankIcon } from './RankIcon';
import { EmptyStandings } from './EmptyStandings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

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

  const renderStreakCircles = () => {
    // For now, return 5 empty circles since users haven't made picks yet
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full border border-gray-300 bg-white"
            title="No pick yet"
          />
        ))}
      </div>
    );
  };

  // Filter out standings with null ranks and show a warning
  const validStandings = standings.filter(s => s.current_rank !== null);
  const nullRankCount = standings.length - validStandings.length;

  return (
    <div className="overflow-x-auto will-change-scroll">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live updates enabled</span>
        {nullRankCount > 0 && (
          <div className="ml-4 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
            {nullRankCount} players without rankings - system issue detected
          </div>
        )}
      </div>
      
      {/* Mobile-optimized table */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {validStandings.map((standing) => {
            const isCurrentUser = currentUserId && standing.user_id === currentUserId;
            const winRate = standing.total_picks > 0 
              ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={standing.id}
                className={`p-4 rounded-lg border ${
                  isCurrentUser 
                    ? 'bg-purple-50 border-plpe-purple shadow-sm' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <RankIcon rank={standing.current_rank} />
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {getDisplayName(standing)}
                        {isCurrentUser && (
                          <span className="text-xs bg-plpe-purple text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      {standing.total_picks === 0 && (
                        <div className="text-xs text-gray-500">No picks yet</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-plpe-purple">
                    {standing.total_points}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-500 text-xs mb-1">Correct</div>
                    <div className="font-semibold">{standing.correct_picks}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 text-xs mb-1">Total</div>
                    <div className="font-semibold">{standing.total_picks}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 text-xs mb-1">Win Rate</div>
                    <div className="font-semibold">{winRate}%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Last 5:</span>
                  {renderStreakCircles()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead className="min-w-[120px]">Player</TableHead>
              <TableHead className="text-center min-w-[80px]">Points</TableHead>
              <TableHead className="text-center min-w-[80px]">Correct</TableHead>
              <TableHead className="text-center min-w-[80px]">Total</TableHead>
              <TableHead className="text-center min-w-[80px]">Win Rate</TableHead>
              <TableHead className="text-center min-w-[100px]">Last 5</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validStandings.map((standing) => {
              const isCurrentUser = currentUserId && standing.user_id === currentUserId;
              const winRate = standing.total_picks > 0 
                ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
                : '0.0';

              return (
                <TableRow
                  key={standing.id}
                  className={`transition-all duration-300 min-h-[48px] ${
                    isCurrentUser 
                      ? 'bg-purple-50 border-l-4 border-plpe-purple shadow-sm' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <TableCell className="text-center py-3">
                    <div className="flex items-center justify-center min-h-[24px]">
                      <RankIcon rank={standing.current_rank} />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="min-h-[24px] flex flex-col justify-center">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {getDisplayName(standing)}
                        {isCurrentUser && (
                          <span className="text-xs bg-plpe-purple text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      {standing.total_picks === 0 && (
                        <div className="text-xs text-gray-500">No picks yet</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="text-lg font-bold text-plpe-purple min-h-[24px] flex items-center justify-center">
                      {standing.total_points}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="font-semibold min-h-[24px] flex items-center justify-center">
                      {standing.correct_picks}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="font-semibold min-h-[24px] flex items-center justify-center">
                      {standing.total_picks}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="font-semibold text-gray-600 min-h-[24px] flex items-center justify-center">
                      {winRate}%
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="min-h-[24px] flex items-center justify-center">
                      {renderStreakCircles()}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
