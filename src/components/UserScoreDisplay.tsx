
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Target, TrendingUp } from 'lucide-react';

export const UserScoreDisplay: React.FC = () => {
  const { userStandings, gameweekScores, currentGameweek } = usePicks();
  const { user } = useAuth();

  if (!user) return null;

  const userStanding = userStandings.find(standing => standing.userId === user.id);
  const currentGameweekScore = currentGameweek 
    ? gameweekScores.find(score => score.userId === user.id && score.gameweekId === currentGameweek.id)
    : null;

  if (!userStanding) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No picks made yet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Picks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">
              0% win rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Not ranked yet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winRate = userStanding.totalPicks > 0 
    ? ((userStanding.correctPicks / userStanding.totalPicks) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-plpe-purple">{userStanding.totalPoints}</div>
          <p className="text-xs text-muted-foreground">
            {currentGameweekScore ? `+${currentGameweekScore.points} this gameweek` : 'Season total'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Correct Picks</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStanding.correctPicks}/{userStanding.totalPicks}</div>
          <p className="text-xs text-muted-foreground">
            {winRate}% win rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userStanding.currentRank ? `#${userStanding.currentRank}` : '-'}
          </div>
          <p className="text-xs text-muted-foreground">
            Global position
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
