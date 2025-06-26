
import React from 'react';
import { RankIcon } from './RankIcon';
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

interface RealtimeDesktopStandingsTableProps {
  standings: Standing[];
  getDisplayName: (standing: Standing) => string;
  currentUserId?: string;
}

export const RealtimeDesktopStandingsTable: React.FC<RealtimeDesktopStandingsTableProps> = ({
  standings,
  getDisplayName,
  currentUserId,
}) => {
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

  return (
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
        {standings.map((standing) => {
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
  );
};
