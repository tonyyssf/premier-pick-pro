
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  correctPicks: number;
  totalPicks: number;
}

export const LeaderboardSection: React.FC = () => {
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'FootyMaster', points: 42, correctPicks: 14, totalPicks: 15 },
    { rank: 2, username: 'PLExpert', points: 39, correctPicks: 13, totalPicks: 15 },
    { rank: 3, username: 'TacticalGenius', points: 36, correctPicks: 12, totalPicks: 15 },
    { rank: 4, username: 'YourUsername', points: 33, correctPicks: 11, totalPicks: 15 },
    { rank: 5, username: 'RedDevil99', points: 30, correctPicks: 10, totalPicks: 15 },
  ];

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

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Leaderboard</h2>
          <p className="text-xl text-gray-600">See how you stack up against players worldwide</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-plpe-gradient px-6 py-4">
            <h3 className="text-xl font-semibold text-white">Top Players</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors ${
                  entry.username === 'YourUsername' ? 'bg-purple-50 border-l-4 border-plpe-purple' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{entry.username}</h4>
                    <p className="text-sm text-gray-600">
                      {entry.correctPicks}/{entry.totalPicks} correct picks
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-plpe-purple">{entry.points}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <button className="bg-plpe-purple text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            View Full Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
