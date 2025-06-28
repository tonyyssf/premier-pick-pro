
import React from 'react';
import { Crown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

interface PodiumLeaderboardProps {
  standings: Standing[];
  currentUserId?: string;
}

export const PodiumLeaderboard: React.FC<PodiumLeaderboardProps> = ({
  standings,
  currentUserId,
}) => {
  const getDisplayName = (standing: Standing) => {
    if (currentUserId && standing.user_id === currentUserId) return 'You';
    return standing.username || standing.name || `Player ${standing.user_id.slice(0, 8)}`;
  };

  const getInitials = (name: string) => {
    if (name === 'You') return 'Y';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const top3 = standings.slice(0, 3).filter(s => s.current_rank !== null);
  const first = top3.find(s => s.current_rank === 1);
  const second = top3.find(s => s.current_rank === 2);
  const third = top3.find(s => s.current_rank === 3);

  const getRankColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-purple-600';
    switch (rank) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-purple-800';
      default: return 'bg-gray-600';
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-20';
      case 2: return 'h-16';
      case 3: return 'h-12';
      default: return 'h-12';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-end justify-center space-x-4 mb-8 pt-8">
        {/* Second Place */}
        {second && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Avatar className="w-16 h-16 border-4 border-gray-400">
                <AvatarFallback className="bg-gray-200 text-gray-800 font-bold">
                  {getInitials(getDisplayName(second))}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-white font-semibold text-center mb-2">
              {getDisplayName(second)}
            </div>
            <div className="text-gray-300 text-sm mb-2">{second.total_points} pts</div>
            <div className={`${getPodiumHeight(2)} w-16 ${getRankColor(2, currentUserId === second.user_id)} rounded-t-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">2</span>
            </div>
          </div>
        )}

        {/* First Place */}
        {first && (
          <div className="flex flex-col items-center">
            <Crown className="w-8 h-8 text-yellow-500 mb-2" />
            <div className="relative mb-2">
              <Avatar className="w-20 h-20 border-4 border-yellow-500">
                <AvatarFallback className="bg-yellow-100 text-yellow-800 font-bold text-lg">
                  {getInitials(getDisplayName(first))}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-white font-semibold text-center mb-2">
              {getDisplayName(first)}
            </div>
            <div className="text-gray-300 text-sm mb-2">{first.total_points} pts</div>
            <div className={`${getPodiumHeight(1)} w-16 ${getRankColor(1, currentUserId === first.user_id)} rounded-t-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">1</span>
            </div>
          </div>
        )}

        {/* Third Place */}
        {third && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Avatar className="w-16 h-16 border-4 border-purple-400">
                <AvatarFallback className="bg-purple-200 text-purple-800 font-bold">
                  {getInitials(getDisplayName(third))}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-white font-semibold text-center mb-2">
              {getDisplayName(third)}
            </div>
            <div className="text-gray-300 text-sm mb-2">{third.total_points} pts</div>
            <div className={`${getPodiumHeight(3)} w-16 ${getRankColor(3, currentUserId === third.user_id)} rounded-t-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
