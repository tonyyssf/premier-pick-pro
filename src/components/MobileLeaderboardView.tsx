
import React, { useState } from 'react';
import { PodiumLeaderboard } from './PodiumLeaderboard';
import { LeaderboardList } from './LeaderboardList';
import { MobileLeaderboardTabs } from './MobileLeaderboardTabs';
import { LeagueSelector } from './LeagueSelector';
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

interface League {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

interface MobileLeaderboardViewProps {
  leagueStandings?: { [leagueId: string]: any[] };
  leagues?: League[];
  selectedLeagueId?: string | null;  
  onLeagueSelect?: (leagueId: string | null) => void;
}

export const MobileLeaderboardView: React.FC<MobileLeaderboardViewProps> = ({
  leagueStandings = {},
  leagues = [],
  selectedLeagueId,
  onLeagueSelect
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

  // Determine which standings to show based on active tab and selected league
  const getCurrentStandings = (): Standing[] => {
    if (activeTab === 'global') {
      return formattedGlobalStandings;
    }
    
    // Friends tab - show selected league or first available league
    if (selectedLeagueId && leagueStandings[selectedLeagueId]) {
      return leagueStandings[selectedLeagueId];
    }
    
    // If no specific league selected, show first available league or subset of global
    const firstLeagueId = Object.keys(leagueStandings)[0];
    if (firstLeagueId) {
      return leagueStandings[firstLeagueId];
    }
    
    return formattedGlobalStandings.slice(0, 8); // Show subset as fallback
  };

  const currentStandings = getCurrentStandings();

  if (loading && currentStandings.length === 0) {
    return <StandingsLoadingState />;
  }

  return (
    <div className="p-4">
      <MobileLeaderboardTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'friends' && leagues.length > 0 && (
        <LeagueSelector
          leagues={leagues}
          selectedLeagueId={selectedLeagueId}
          onLeagueSelect={onLeagueSelect}
        />
      )}
      
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
            {activeTab === 'friends' ? 'Join a league to see friend standings!' : 'Start making picks to see the leaderboard!'}
          </div>
        </div>
      )}
    </div>
  );
};
