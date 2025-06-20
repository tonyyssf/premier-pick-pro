
import React from 'react';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export const LeaderboardSection: React.FC = () => {
  const { userStandings, calculateScores, scoresLoading } = usePicks();
  const { user } = useAuth();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">{rank}</span>;
    }
  };

  const handleUpdateScores = async () => {
    await calculateScores();
  };

  const getCurrentUserStanding = () => {
    if (!user) return null;
    return userStandings.find(standing => standing.userId === user.id);
  };

  const currentUserStanding = getCurrentUserStanding();

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Leaderboard</h2>
          <p className="text-xl text-gray-600 mb-6">See how you stack up against players worldwide</p>
          
          <Button
            onClick={handleUpdateScores}
            disabled={scoresLoading}
            className="bg-plpe-purple hover:bg-purple-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${scoresLoading ? 'animate-spin' : ''}`} />
            {scoresLoading ? 'Calculating...' : 'Update Scores'}
          </Button>
        </div>

        {userStandings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Standings Yet</h3>
            <p className="text-gray-600">
              Standings will appear once players start making picks and gameweeks are completed.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-plpe-gradient px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Top Players</h3>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-center">Correct Picks</TableHead>
                    <TableHead className="text-center">Total Picks</TableHead>
                    <TableHead className="text-center">Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStandings.slice(0, 10).map((standing, index) => {
                    const rank = standing.currentRank || index + 1;
                    const isCurrentUser = user && standing.userId === user.id;
                    const winRate = standing.totalPicks > 0 
                      ? ((standing.correctPicks / standing.totalPicks) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <TableRow
                        key={standing.id}
                        className={isCurrentUser ? 'bg-purple-50 border-l-4 border-plpe-purple' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900">
                            {isCurrentUser ? 'You' : `Player ${standing.userId.slice(0, 8)}`}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-2xl font-bold text-plpe-purple">
                            {standing.totalPoints}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold">
                            {standing.correctPicks}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold">
                            {standing.totalPicks}
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

            {currentUserStanding && currentUserStanding.currentRank && currentUserStanding.currentRank > 10 && (
              <div className="border-t bg-gray-50 px-6 py-4">
                <div className="text-center text-gray-600">
                  <span className="font-semibold">Your Position: </span>
                  #{currentUserStanding.currentRank} with {currentUserStanding.totalPoints} points
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
