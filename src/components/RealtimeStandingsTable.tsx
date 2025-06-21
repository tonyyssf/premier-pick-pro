
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

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live updates enabled</span>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">Correct</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Win Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing, index) => {
            const rank = standing.current_rank || index + 1;
            const isCurrentUser = currentUserId && standing.user_id === currentUserId;
            const winRate = standing.total_picks > 0 
              ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
              : '0.0';

            return (
              <TableRow
                key={standing.id}
                className={`transition-all duration-300 ${
                  isCurrentUser ? 'bg-purple-50 border-l-4 border-plpe-purple animate-pulse' : 'hover:bg-gray-50'
                }`}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    <RankIcon rank={rank} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-gray-900">
                    {isCurrentUser ? (
                      <span className="flex items-center gap-2">
                        You
                        <div className="w-2 h-2 bg-plpe-purple rounded-full animate-pulse"></div>
                      </span>
                    ) : (
                      `Player ${standing.user_id.slice(0, 8)}`
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-lg font-bold text-plpe-purple">
                    {standing.total_points}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-semibold">
                    {standing.correct_picks}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-semibold">
                    {standing.total_picks}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="font-semibold text-gray-600">
                    {winRate}%
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
