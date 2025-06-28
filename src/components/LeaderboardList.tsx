
import React from 'react';
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

interface LeaderboardListProps {
  standings: Standing[];
  currentUserId?: string;
  startFrom?: number;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  standings,
  currentUserId,
  startFrom = 4
}) => {
  const getDisplayName = (standing: Standing) => {
    if (currentUserId && standing.user_id === currentUserId) return 'You';
    return standing.username || standing.name || `Player ${standing.user_id.slice(0, 8)}`;
  };

  const getInitials = (name: string) => {
    if (name === 'You') return 'Y';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const remainingStandings = standings.slice(startFrom - 1).filter(s => s.current_rank !== null);

  const getGameweekChange = () => {
    // Mock gameweek change data - in real app this would come from props
    const changes = ['+3 GW', '+0 GW', '+1 GW', '+3 GW'];
    return changes[Math.floor(Math.random() * changes.length)];
  };

  return (
    <div className="space-y-3">
      {remainingStandings.map((standing) => {
        const isCurrentUser = currentUserId && standing.user_id === currentUserId;
        const displayName = getDisplayName(standing);
        
        return (
          <div
            key={standing.id}
            className={`flex items-center justify-between p-4 rounded-lg ${
              isCurrentUser ? 'bg-purple-900/50' : 'bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {standing.current_rank}
              </div>
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gray-300 text-gray-800 font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-semibold">{displayName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">{standing.total_points} pts</div>
              <div className="text-gray-400 text-sm">{getGameweekChange()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
