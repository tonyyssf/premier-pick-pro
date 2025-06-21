
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

  // Always show user score display, even with 0 points
  const displayPoints = userStanding?.totalPoints || 0;
  const displayCorrectPicks = userStanding?.correctPicks || 0;
  const displayTotalPicks = userStanding?.totalPicks || 0;
  const displayRank = userStanding?.currentRank;

  const winRate = displayTotalPicks > 0 
    ? ((displayCorrectPicks / displayTotalPicks) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-plpe-purple">{displayPoints}</div>
          <p className="text-xs text-muted-foreground">
            {currentGameweekScore ? `+${currentGameweekScore.points} this gameweek` : 
             displayTotalPicks === 0 ? 'Make your first pick!' : 'Season total'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Correct Picks</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayCorrectPicks}/{displayTotalPicks}</div>
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
            {displayRank ? `#${displayRank}` : '-'}
          </div>
          <p className="text-xs text-muted-foreground">
            {displayTotalPicks === 0 ? 'Start making picks to get ranked!' : 'Global position'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
