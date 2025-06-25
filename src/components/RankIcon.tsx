
import React from 'react';

interface RankIconProps {
  rank: number;
}

export const RankIcon: React.FC<RankIconProps> = ({ rank }) => {
  return <span className="text-sm font-bold text-gray-600">{rank}</span>;
};
