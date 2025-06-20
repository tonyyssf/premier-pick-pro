
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankIconProps {
  rank: number;
}

export const RankIcon: React.FC<RankIconProps> = ({ rank }) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-600">{rank}</span>;
  }
};
