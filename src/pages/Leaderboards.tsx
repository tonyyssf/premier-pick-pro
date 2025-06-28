
import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { LeaderboardTabs } from '@/components/LeaderboardTabs';
import { BottomNavigation } from '@/components/BottomNavigation';

interface LeagueWithRank {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

const Leaderboards = () => {
  const [leaguesWithRanks, setLeaguesWithRanks] = useState<LeagueWithRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeaguesWithRanks = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Fetch leagues user is a member of
      const { data: userLeagues, error: userLeaguesError } = await supabase
        .from('leagues')
        .select(`
          id,
          name,
          description,
          league_members!inner(user_id)
        `)
        .eq('league_members.user_id', user.id);

      if (userLeaguesError) throw userLeaguesError;

      // Get member counts and user ranks for all leagues
      const leaguesWithRankData = await Promise.all(
        userLeagues.map(async (league) => {
          // Get member count
          const { count } = await supabase
            .from('league_members')
            .select('*', { count: 'exact', head: true })
            .eq('league_id', league.id);

          // Get user's rank in this league from the unified standings table
          const { data: userStanding } = await supabase
            .from('standings')
            .select('current_rank')
            .eq('league_id', league.id)
            .eq('user_id', user.id)
            .maybeSingle();

          return {
            id: league.id,
            name: league.name,
            description: league.description,
            member_count: count || 0,
            user_rank: userStanding?.current_rank || null
          };
        })
      );

      setLeaguesWithRanks(leaguesWithRankData);
      // Expand all leagues by default
      setExpandedLeagues(new Set(leaguesWithRankData.map(league => league.id)));
      console.log('Fetched leagues with ranks from unified standings:', leaguesWithRankData);
    } catch (error: any) {
      console.error('Error fetching leagues with ranks:', error);
      toast({
        title: "Error Loading Leagues",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaguesWithRanks();
    // No real-time subscriptions for weekly updates
  }, [user]);

  const toggleLeagueExpansion = (leagueId: string) => {
    setExpandedLeagues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leagueId)) {
        newSet.delete(leagueId);
      } else {
        newSet.add(leagueId);
      }
      return newSet;
    });
  };

  const handleRefreshNeeded = () => {
    // Refresh the leagues data after standings refresh
    fetchLeaguesWithRanks();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white mb-6">Leaderboards</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20">
          <LeaderboardTabs
            leaguesWithRanks={leaguesWithRanks}
            isLoading={isLoading}
            expandedLeagues={expandedLeagues}
            onToggleExpansion={toggleLeagueExpansion}
            onRefreshNeeded={handleRefreshNeeded}
          />
        </div>
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Leaderboards;
