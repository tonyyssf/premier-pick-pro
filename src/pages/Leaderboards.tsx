
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LeagueLeaderboard } from '@/components/LeagueLeaderboard';
import { LeaderboardSection } from '@/components/LeaderboardSection';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Leaderboards</h1>
            <p className="text-gray-600 mb-6">
              View global rankings and your performance in different leagues.
            </p>
          </div>

          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
              <TabsTrigger value="leagues">My League Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="mt-6">
              <LeaderboardSection />
            </TabsContent>

            <TabsContent value="leagues" className="mt-6">
              {isLoading ? (
                <LoadingSpinner message="Loading your league rankings..." />
              ) : leaguesWithRanks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You're not a member of any leagues yet.</p>
                  <p className="text-sm text-gray-500">Create or join a league to see your rankings!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {leaguesWithRanks.map((league) => (
                    <Collapsible key={league.id}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CollapsibleTrigger 
                          className="w-full"
                          onClick={() => toggleLeagueExpansion(league.id)}
                        >
                          <CardHeader className="bg-plpe-gradient text-white">
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <CardTitle className="text-lg">{league.name}</CardTitle>
                                {league.description && (
                                  <p className="text-sm text-white/80 mt-1">{league.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm text-white/80">Your Rank</p>
                                  <div className="flex items-center justify-end gap-2">
                                    {getRankIcon(league.user_rank)}
                                    {league.user_rank && (
                                      <span className="text-sm text-white/70">
                                        of {league.member_count}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {expandedLeagues.has(league.id) ? (
                                  <ChevronUp className="h-5 w-5 text-white" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-1">Members</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {league.member_count}
                              </p>
                            </div>
                            {!league.user_rank && (
                              <div className="flex-1 ml-4">
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-sm text-yellow-800">
                                    No ranking yet - start making picks to see your position!
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <CollapsibleContent className="mt-6">
                            <LeagueLeaderboard 
                              leagueId={league.id} 
                              leagueName={league.name}
                            />
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Leaderboards;
