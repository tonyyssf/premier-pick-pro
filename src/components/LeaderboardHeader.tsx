
import React from 'react';

export const LeaderboardHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        Leaderboards
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-lg font-normal text-gray-600">Weekly Updates</span>
      </h1>
      <p className="text-gray-600 mb-6">
        View global rankings and your performance in different leagues. Standings update weekly after gameweeks end.
      </p>
    </div>
  );
};
