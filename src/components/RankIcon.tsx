
import React from 'react';

interface RankIconProps {
  rank: number | null;
}

export const RankIcon: React.FC<RankIconProps> = ({ rank }) => {
  // Remove the 999 fallback that was hiding NULL rank issues
  if (rank === null || rank === undefined) {
    return <span className="text-sm font-bold text-gray-400">-</span>;
  }
  
  return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
};
