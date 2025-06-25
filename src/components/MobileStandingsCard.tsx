
import React from 'react';
import { RankIcon } from './RankIcon';
import { StreakIndicator } from './StreakIndicator';

interface Standing {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
  username?: string;
  name?: string;
}

interface MobileStandingsCardProps {
  standing: Standing;
  isCurrentUser: boolean;
  displayName: string;
  winRate: string;
}

export const MobileStandingsCard: React.FC<MobileStandingsCardProps> = ({
  standing,
  isCurrentUser,
  displayName,
  winRate,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border ${
        isCurrentUser 
          ? 'bg-purple-50 border-plpe-purple shadow-sm' 
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <RankIcon rank={standing.current_rank} />
          <div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              {displayName}
              {isCurrentUser && (
                <span className="text-xs bg-plpe-purple text-white px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </div>
            {standing.total_picks === 0 && (
              <div className="text-xs text-gray-500">No picks yet</div>
            )}
          </div>
        </div>
        <div className="text-xl font-bold text-plpe-purple">
          {standing.total_points}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">Correct</div>
          <div className="font-semibold">{standing.correct_picks}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">Total</div>
          <div className="font-semibold">{standing.total_picks}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">Win Rate</div>
          <div className="font-semibold">{winRate}%</div>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">Last 5:</span>
        <StreakIndicator />
      </div>
    </div>
  );
};
