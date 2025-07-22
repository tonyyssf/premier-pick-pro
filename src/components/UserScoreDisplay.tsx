
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePicks } from '@/contexts/PicksContext';
import { GuestUserScoreDisplay } from './GuestUserScoreDisplay';

export const UserScoreDisplay: React.FC = () => {
  const { user } = useAuth();
  const { userStandings, loading } = usePicks();

  // Show guest version if not authenticated
  if (!user) {
    return <GuestUserScoreDisplay />;
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const globalStanding = userStandings?.find(s => s.league_id === null);
  const totalPoints = globalStanding?.total_points || 0;
  const correctPicks = globalStanding?.correct_picks || 0;
  const totalPicks = globalStanding?.total_picks || 0;
  const currentRank = globalStanding?.current_rank || 0;
  const winRate = totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;

  const getBadgeVariant = (rank: number) => {
    if (rank <= 3) return 'default';
    if (rank <= 10) return 'secondary';
    return 'outline';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank <= 3) return <Trophy className="h-4 w-4 text-gray-400" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-plpe-purple" />
          <span>Your Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-plpe-purple" />
            </div>
            <div className="text-2xl font-bold text-plpe-purple">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{correctPicks}</div>
            <div className="text-sm text-gray-600">Correct Picks</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-center mb-2 space-x-1">
              {getRankIcon(currentRank)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-2xl font-bold text-orange-600">#{currentRank}</div>
              <Badge variant={getBadgeVariant(currentRank)} className="text-xs">
                Global
              </Badge>
            </div>
            <div className="text-sm text-gray-600">Rank</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
