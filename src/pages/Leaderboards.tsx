import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { LeaderboardTabs } from '@/components/LeaderboardTabs';

interface LeagueWithRank {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

const UnauthenticatedLeaderboardsView = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Leaderboards</h1>
          <p className="text-gray-600 mb-8">
            See how you stack up against other players in leagues and globally!
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-plpe-purple" />
                <span>Sign in to see leaderboards</span>
              </CardTitle>
              <CardDescription>
                Track your progress and compete with friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/how-to-play">Learn How to Play</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <Users className="h-12 w-12 text-plpe-purple mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">League Rankings</h3>
            <p className="text-gray-600 text-center">See your position in each league you've joined and track your progress.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <Trophy className="h-12 w-12 text-plpe-purple mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Global Leaderboard</h3>
            <p className="text-gray-600 text-center">Compete against all players worldwide and see who's the ultimate picker.</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <Target className="h-12 w-12 text-plpe-purple mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Weekly Updates</h3>
            <p className="text-gray-600 text-center">Rankings are updated weekly after all matches are completed.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Leaderboards = () => {
  const [leaguesWithRanks, setLeaguesWithRanks] = useState<LeagueWithRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Show unauthenticated view if user is not logged in
  if (!user) {
    return <UnauthenticatedLeaderboardsView />;
  }

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
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <LeaderboardHeader />
        <LeaderboardTabs
          leaguesWithRanks={leaguesWithRanks}
          isLoading={isLoading}
          expandedLeagues={expandedLeagues}
          onToggleExpansion={toggleLeagueExpansion}
          onRefreshNeeded={handleRefreshNeeded}
        />
      </div>
    </Layout>
  );
};

export default Leaderboards;
