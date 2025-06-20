
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { LeagueLeaderboard } from '@/components/LeagueLeaderboard';
import { LeaderboardSection } from '@/components/LeaderboardSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  is_public: boolean;
  max_members: number | null;
  created_at: string;
  member_count?: number;
  is_creator?: boolean;
  is_member?: boolean;
}

const Leaderboards = () => {
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMyLeagues = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Fetch leagues user is a member of or created
      const { data: userLeagues, error: userLeaguesError } = await supabase
        .from('leagues')
        .select(`
          *,
          league_members!inner(user_id)
        `)
        .eq('league_members.user_id', user.id);

      if (userLeaguesError) throw userLeaguesError;

      // Get member counts for all leagues
      const memberCounts = await Promise.all(
        userLeagues.map(async (league) => {
          const { count } = await supabase
            .from('league_members')
            .select('*', { count: 'exact', head: true })
            .eq('league_id', league.id);
          return { leagueId: league.id, count: count || 0 };
        })
      );

      const memberCountMap = memberCounts.reduce((acc, { leagueId, count }) => {
        acc[leagueId] = count;
        return acc;
      }, {} as Record<string, number>);

      // Process user leagues
      const processedUserLeagues = userLeagues.map(league => ({
        ...league,
        member_count: memberCountMap[league.id],
        is_creator: league.creator_id === user.id,
        is_member: true
      }));

      setMyLeagues(processedUserLeagues);
      console.log('Fetched user leagues for leaderboards:', processedUserLeagues);
    } catch (error: any) {
      console.error('Error fetching leagues:', error);
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
    fetchMyLeagues();
  }, [user]);

  const handleTabChange = (value: string) => {
    console.log('Leaderboards tab changed to:', value);
    setActiveTab(value);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Leaderboards</h1>
            <p className="text-gray-600 mb-6">
              See how you rank globally and within your leagues!
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
              <TabsTrigger value="leagues">My League Leaderboards ({myLeagues.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="global" className="mt-6">
              <LeaderboardSection />
            </TabsContent>
            
            <TabsContent value="leagues" className="mt-6">
              {isLoading ? (
                <LoadingSpinner message="Loading league leaderboards..." />
              ) : myLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Join a league to view league leaderboards.</p>
                  <p className="text-sm text-gray-500">Create or join a league to see how you rank against other members!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {myLeagues.map((league) => (
                    <LeagueLeaderboard
                      key={league.id}
                      leagueId={league.id}
                      leagueName={league.name}
                    />
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
