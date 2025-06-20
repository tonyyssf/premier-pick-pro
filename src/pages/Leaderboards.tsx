
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

          // Get user's rank in this league
          const { data: userStanding } = await supabase
            .from('league_standings')
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
      console.log('Fetched leagues with ranks:', leaguesWithRankData);
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

  const getRankIcon = (rank: number | null) => {
    if (!rank) return <span className="text-lg font-bold text-gray-400">-</span>;
    
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My League Rankings</h1>
            <p className="text-gray-600 mb-6">
              See your current rank in each league you're a member of.
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading your league rankings..." />
          ) : leaguesWithRanks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You're not a member of any leagues yet.</p>
              <p className="text-sm text-gray-500">Create or join a league to see your rankings!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leaguesWithRanks.map((league) => (
                <Card key={league.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-plpe-gradient text-white">
                    <CardTitle className="text-lg">{league.name}</CardTitle>
                    {league.description && (
                      <p className="text-sm text-white/80">{league.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Your Rank</p>
                        <div className="flex items-center gap-2">
                          {getRankIcon(league.user_rank)}
                          {league.user_rank && (
                            <span className="text-sm text-gray-500">
                              out of {league.member_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Members</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {league.member_count}
                        </p>
                      </div>
                    </div>
                    {!league.user_rank && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          No ranking yet - start making picks to see your position!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Leaderboards;
