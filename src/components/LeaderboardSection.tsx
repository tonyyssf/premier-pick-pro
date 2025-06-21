
import React from 'react';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';
import { useWeeklyStandings } from '../hooks/useRealtimeStandings';
import { Button } from './ui/button';
import { WeeklyStandingsTable } from './WeeklyStandingsTable';

export const LeaderboardSection: React.FC = () => {
  const { calculateScores, scoresLoading } = usePicks();
  const { user } = useAuth();
  const { userStandings, loading } = useWeeklyStandings();

  const handleUpdateScores = async () => {
    await calculateScores();
  };

  const getCurrentUserStanding = () => {
    if (!user) return null;
    return userStandings.find(standing => standing.userId === user.id);
  };

  const currentUserStanding = getCurrentUserStanding();

  // Convert to the format expected by WeeklyStandingsTable
  const formattedStandings = userStandings.map(standing => ({
    id: standing.id,
    user_id: standing.userId,
    total_points: standing.totalPoints,
    correct_picks: standing.correctPicks,
    total_picks: standing.totalPicks,
    current_rank: standing.currentRank,
  }));

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

        {userStandings.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Standings Yet</h3>
            <p className="text-gray-600">
              Standings will appear once players start making picks and gameweeks are completed.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-plpe-gradient px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                Top Players
                <span className="text-sm font-normal">(Weekly Updates)</span>
              </h3>
            </div>
            
            <div className="p-6">
              <WeeklyStandingsTable 
                standings={formattedStandings.slice(0, 10)} 
                currentUserId={user?.id}
                isLoading={loading}
              />
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
