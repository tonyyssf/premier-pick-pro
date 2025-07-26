import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  points: number;
  rank: number;
  previousRank?: number;
  correctPicks: number;
  totalPicks: number;
  winRate: number;
}

interface PerformanceOptimizedLeaderboardProps {
  data: LeaderboardEntry[];
  loading: boolean;
  currentUserId?: string;
  onUserClick?: (userId: string) => void;
}

// Memoized individual row component
const LeaderboardRow = React.memo<{
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  onClick?: () => void;
}>(({ entry, isCurrentUser, onClick }) => {
  const rankChange = useMemo(() => {
    if (!entry.previousRank) return null;
    const change = entry.previousRank - entry.rank;
    if (change > 0) return { direction: 'up', value: change };
    if (change < 0) return { direction: 'down', value: Math.abs(change) };
    return { direction: 'same', value: 0 };
  }, [entry.previousRank, entry.rank]);

  const rankIcon = useMemo(() => {
    if (entry.rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (entry.rank === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (entry.rank === 3) return <Trophy className="w-4 h-4 text-amber-600" />;
    return null;
  }, [entry.rank]);

  const rankChangeIcon = useMemo(() => {
    if (!rankChange) return null;
    switch (rankChange.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'same':
        return <Minus className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  }, [rankChange]);

  return (
    <div
      className={`flex items-center justify-between p-4 border-b last:border-b-0 transition-colors ${
        isCurrentUser 
          ? 'bg-purple-50 border-purple-200' 
          : 'hover:bg-gray-50'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {rankIcon}
          <span className={`font-semibold ${entry.rank <= 3 ? 'text-lg' : 'text-base'}`}>
            {entry.rank}
          </span>
          {rankChange && (
            <div className="flex items-center space-x-1">
              {rankChangeIcon}
              {rankChange.value > 0 && (
                <span className="text-xs text-gray-500">
                  {rankChange.value}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className={`font-medium ${isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
            {entry.username}
          </span>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{entry.correctPicks}/{entry.totalPicks} picks</span>
            <span>•</span>
            <span>{(entry.winRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-xl font-bold text-gray-900">
          {entry.points}
        </div>
        <div className="text-sm text-gray-500">points</div>
      </div>
    </div>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

// Main component with performance optimizations
export const PerformanceOptimizedLeaderboard: React.FC<PerformanceOptimizedLeaderboardProps> = React.memo(({
  data,
  loading,
  currentUserId,
  onUserClick
}) => {
  // Memoize sorted data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // First sort by points (descending)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // Then by win rate (descending)
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      // Finally by username (alphabetical)
      return a.username.localeCompare(b.username);
    });
  }, [data]);

  // Memoize current user's rank
  const currentUserRank = useMemo(() => {
    if (!currentUserId) return null;
    return sortedData.findIndex(entry => entry.id === currentUserId) + 1;
  }, [sortedData, currentUserId]);

  // Memoize click handler
  const handleUserClick = useCallback((userId: string) => {
    onUserClick?.(userId);
  }, [onUserClick]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>League Standings</CardTitle>
          {currentUserRank && (
            <Badge variant="secondary">
              Your Rank: {currentUserRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {sortedData.map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              isCurrentUser={entry.id === currentUserId}
              onClick={() => handleUserClick(entry.id)}
            />
          ))}
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No standings data available
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PerformanceOptimizedLeaderboard.displayName = 'PerformanceOptimizedLeaderboard'; 