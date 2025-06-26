
import React from 'react';

interface RealtimeStandingsHeaderProps {
  nullRankCount: number;
}

export const RealtimeStandingsHeader: React.FC<RealtimeStandingsHeaderProps> = ({ 
  nullRankCount 
}) => {
  return (
    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Live updates enabled</span>
      {nullRankCount > 0 && (
        <div className="ml-4 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
          {nullRankCount} players without rankings - system issue detected
        </div>
      )}
    </div>
  );
};
