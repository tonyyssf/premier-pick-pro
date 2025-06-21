
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

interface StandingsTableProps {
  standings: Standing[];
  currentUserId?: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ 
  standings, 
  currentUserId 
}) => {
  if (standings.length === 0) {
    return <EmptyStandings />;
  }

  return (
    <div className="overflow-x-auto">
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
          {standings.map((standing) => {
            const rank = standing.current_rank || 999;
            const isCurrentUser = currentUserId && standing.user_id === currentUserId;
            const winRate = standing.total_picks > 0 
              ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
              : '0.0';

            return (
              <TableRow
                key={standing.id}
                className={isCurrentUser ? 'bg-purple-50 border-l-4 border-plpe-purple' : ''}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    <RankIcon rank={rank} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-gray-900">
                    {isCurrentUser ? 'You' : `Player ${standing.user_id.slice(0, 8)}`}
                  </div>
                  {standing.total_picks === 0 && (
                    <div className="text-xs text-gray-500">No picks yet</div>
                  )}
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
