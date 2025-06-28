
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { Trophy, Users, History } from 'lucide-react';

export const FriendsLeaderboard: React.FC = () => {
  const { userStandings } = usePicks();

  // Get top 5 users for the friends leaderboard
  const topUsers = userStandings
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .slice(0, 5);

  return (
    <div className="mx-4 mt-6 mb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Friends Leaderboard</h3>
        <span className="text-purple-400 text-sm">View All</span>
      </div>
      
      {topUsers.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No leaderboard data available yet.
        </div>
      ) : (
        <div className="space-y-2">
          {topUsers.map((standing, index) => (
            <div key={standing.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">User #{standing.userId.slice(-4)}</div>
                  <div className="text-gray-400 text-sm">{standing.totalPoints} points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
