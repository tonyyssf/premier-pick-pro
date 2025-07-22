
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Layout } from '@/components/Layout';
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
      
      // Then load league data with minimal queries
      // This implementation would need the actual supabase queries
      // but is structured to minimize database calls
      
      setLeaguesWithRanks([]);
      setExpandedLeagues(new Set());
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
