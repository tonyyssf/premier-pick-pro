
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeStandings } from '@/hooks/useRealtimeStandings';
import { RealtimeStandingsTable } from './RealtimeStandingsTable';
import { LoadingSpinner } from './LoadingSpinner';

interface LeagueLeaderboardProps {
  leagueId: string;
  leagueName: string;
}

export const LeagueLeaderboard: React.FC<LeagueLeaderboardProps> = ({ 
  leagueId, 
  leagueName 
}) => {
  const { user } = useAuth();
  const { leagueStandings, loading, loadLeagueStandings } = useRealtimeStandings();

  const currentLeagueStandings = leagueStandings[leagueId] || [];

  useEffect(() => {
    loadLeagueStandings(leagueId);
  }, [leagueId]);

  if (loading && currentLeagueStandings.length === 0) {
    return <LoadingSpinner message="Loading live leaderboard..." />;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {leagueName} Standings
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-normal text-gray-600">Live</span>
      </h4>
      <RealtimeStandingsTable 
        standings={currentLeagueStandings} 
        currentUserId={user?.id}
        isLoading={loading && currentLeagueStandings.length === 0}
      />
    </div>
  );
};
