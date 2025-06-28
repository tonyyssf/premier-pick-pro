
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';

export const RecentResults: React.FC = () => {
  const { gameweekScores } = usePicks();
  const { user } = useAuth();

  if (!user) return null;

  // Get the last 3 gameweek scores for the user
  const userScores = gameweekScores
    .filter(score => score.userId === user.id)
    .sort((a, b) => a.gameweekId.localeCompare(b.gameweekId))
    .slice(-3);

  const getResultBadge = (points: number, isCorrect: boolean) => {
    if (points === 3 && isCorrect) {
      return { text: 'Win', className: 'bg-green-500 text-white' };
    } else if (points === 1) {
      return { text: 'Draw', className: 'bg-yellow-500 text-white' };
    } else if (points === 0) {
      return { text: 'Loss', className: 'bg-red-500 text-white' };
    }
    return { text: 'Pending', className: 'bg-gray-500 text-white' };
  };

  const getPointsBadge = (points: number) => {
    if (points === 3) {
      return { text: '+3', className: 'bg-green-500 text-white' };
    } else if (points === 1) {
      return { text: '+1', className: 'bg-yellow-500 text-white' };
    } else {
      return { text: '+0', className: 'bg-gray-500 text-white' };
    }
  };

  if (userScores.length === 0) {
    return (
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Results</h3>
          <span className="text-purple-400 text-sm">View All</span>
        </div>
        <div className="text-center text-gray-400 py-8">
          No results yet. Make your first pick to see results here!
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Results</h3>
        <span className="text-purple-400 text-sm">View All</span>
      </div>
      
      <div className="space-y-3">
        {userScores.map((score, index) => {
          const resultBadge = getResultBadge(score.points, score.isCorrect);
          const pointsBadge = getPointsBadge(score.points);
          
          return (
            <div key={score.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  T{index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">Team Pick</div>
                  <div className="text-gray-400 text-sm">vs. Opponent</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${resultBadge.className}`}>
                  {resultBadge.text}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${pointsBadge.className}`}>
                  {pointsBadge.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
