
import React, { useState } from 'react';
import { PodiumLeaderboard } from './PodiumLeaderboard';
import { LeaderboardList } from './LeaderboardList';
import { MobileLeaderboardTabs } from './MobileLeaderboardTabs';
import { useAuth } from '@/contexts/AuthContext';
import { useWeeklyStandings } from '@/hooks/useRealtimeStandings';
import { StandingsLoadingState } from './StandingsLoadingState';

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

interface MobileLeaderboardViewProps {
  leagueStandings?: { [leagueId: string]: any[] };
}

export const MobileLeaderboardView: React.FC<MobileLeaderboardViewProps> = ({
  leagueStandings = {}
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'global'>('friends');
  const { user } = useAuth();
  const { userStandings, loading } = useWeeklyStandings();

  // Convert global standings to the format expected by components
  const formattedGlobalStandings: Standing[] = userStandings.map(standing => ({
    id: standing.id,
    user_id: standing.userId,
    total_points: standing.totalPoints,
    correct_picks: standing.correctPicks,
    total_picks: standing.totalPicks,
    current_rank: standing.currentRank,
    username: standing.username,
    name: standing.name,
  }));

  // For friends tab, we'll use the first league's standings or create mock data
  const friendsStandings: Standing[] = Object.keys(leagueStandings).length > 0 
    ? Object.values(leagueStandings)[0] || []
    : formattedGlobalStandings.slice(0, 8); // Show subset as "friends"

  const currentStandings = activeTab === 'friends' ? friendsStandings : formattedGlobalStandings;

  if (loading && currentStandings.length === 0) {
    return <StandingsLoadingState />;
  }

  return (
    <div className="p-4">
      <MobileLeaderboardTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {currentStandings.length > 0 ? (
        <>
          <PodiumLeaderboard 
            standings={currentStandings}
            currentUserId={user?.id}
          />
          <LeaderboardList 
            standings={currentStandings}
            currentUserId={user?.id}
            startFrom={4}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No standings yet</div>
          <div className="text-gray-500 text-sm">
            Start making picks to see the leaderboard!
          </div>
        </div>
      )}
    </div>
  );
};
