
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StandingsTable } from './StandingsTable';
import { LoadingSpinner } from './LoadingSpinner';

interface LeagueStanding {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
}

interface LeagueLeaderboardProps {
  leagueId: string;
  leagueName: string;
}

export const LeagueLeaderboard: React.FC<LeagueLeaderboardProps> = ({ 
  leagueId, 
  leagueName 
}) => {
  const [leagueStandings, setLeagueStandings] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadLeagueStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('league_standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setLeagueStandings(data || []);
    } catch (error: any) {
      console.error('Error loading league standings:', error);
      toast({
        title: "Error Loading League Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadLeagueStandings();
      setLoading(false);
    };

    loadData();
  }, [leagueId]);

  if (loading) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {leagueName} Standings
      </h4>
      <StandingsTable 
        standings={leagueStandings} 
        currentUserId={user?.id} 
      />
    </div>
  );
};
