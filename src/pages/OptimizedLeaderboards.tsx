
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedStandings } from '@/hooks/useOptimizedStandings';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Lazy load heavy components
const LeaderboardTabs = lazy(() => import('@/components/LeaderboardTabs').then(module => ({ default: module.LeaderboardTabs })));

interface LeagueWithRank {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

const OptimizedLeaderboards = () => {
  const [leaguesWithRanks, setLeaguesWithRanks] = useState<LeagueWithRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { loadGlobalStandings } = useOptimizedStandings();

  const fetchLeaguesWithRanks = async () => {
    if (!user) {
      setLeaguesWithRanks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Load global standings first (cached)
      await loadGlobalStandings();
      
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Suspense fallback={<LoadingSpinner message="Loading leaderboards..." />}>
          <LeaderboardTabs
            leaguesWithRanks={leaguesWithRanks}
            isLoading={isLoading}
            expandedLeagues={expandedLeagues}
            onToggleExpansion={toggleLeagueExpansion}
          />
        </Suspense>
      </div>
    </Layout>
  );
};

export default OptimizedLeaderboards;
