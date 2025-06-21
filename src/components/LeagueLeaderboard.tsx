
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWeeklyStandings } from '@/hooks/useRealtimeStandings';
import { WeeklyStandingsTable } from './WeeklyStandingsTable';
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
  const { leagueStandings, loading, loadLeagueStandings } = useWeeklyStandings();

  const currentLeagueStandings = leagueStandings[leagueId] || [];

  useEffect(() => {
    loadLeagueStandings(leagueId);
  }, [leagueId]);

  if (loading && currentLeagueStandings.length === 0) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {leagueName} Standings
        <span className="text-sm font-normal text-gray-600">(Weekly Updates)</span>
      </h4>
      <WeeklyStandingsTable 
        standings={currentLeagueStandings} 
        currentUserId={user?.id}
        isLoading={loading && currentLeagueStandings.length === 0}
      />
    </div>
  );
};
