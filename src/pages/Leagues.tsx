
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { LeagueCard } from '@/components/LeagueCard';
import { LeagueLeaderboard } from '@/components/LeagueLeaderboard';
import { CreateLeagueDialog } from '@/components/CreateLeagueDialog';
import { JoinLeagueDialog } from '@/components/JoinLeagueDialog';
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

const Leagues = () => {
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningLeague, setJoiningLeague] = useState<string | null>(null);
  const [leavingLeague, setLeavingLeague] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('my-leagues');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeagues = async () => {
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

      // Fetch public leagues
      const { data: publicLeaguesData, error: publicLeaguesError } = await supabase
        .from('leagues')
        .select('*')
        .eq('is_public', true);

      if (publicLeaguesError) throw publicLeaguesError;

      // Get member counts for all leagues
      const allLeagueIds = [
        ...userLeagues.map(l => l.id),
        ...publicLeaguesData.map(l => l.id)
      ].filter((id, index, arr) => arr.indexOf(id) === index);

      const memberCounts = await Promise.all(
        allLeagueIds.map(async (leagueId) => {
          const { count } = await supabase
            .from('league_members')
            .select('*', { count: 'exact', head: true })
            .eq('league_id', leagueId);
          return { leagueId, count: count || 0 };
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

      // Process public leagues and filter out ones user is already in
      const userLeagueIds = new Set(userLeagues.map(l => l.id));
      const processedPublicLeagues = publicLeaguesData
        .filter(league => !userLeagueIds.has(league.id))
        .map(league => ({
          ...league,
          member_count: memberCountMap[league.id],
          is_creator: league.creator_id === user.id,
          is_member: false
        }));

      setMyLeagues(processedUserLeagues);
      setPublicLeagues(processedPublicLeagues);
      console.log('Fetched leagues:', { userLeagues: processedUserLeagues, publicLeagues: processedPublicLeagues });
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

  const handleJoinLeague = async (leagueId: string) => {
    if (!user) return;

    setJoiningLeague(leagueId);
    
    try {
      const { error } = await supabase
        .from('league_members')
        .insert({
          league_id: leagueId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Joined League!",
        description: "You've successfully joined the league.",
      });

      fetchLeagues(); // Refresh the leagues
    } catch (error: any) {
      toast({
        title: "Error Joining League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setJoiningLeague(null);
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!user) return;

    setLeavingLeague(leagueId);
    
    try {
      const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left League",
        description: "You've successfully left the league.",
      });

      fetchLeagues(); // Refresh the leagues
    } catch (error: any) {
      toast({
        title: "Error Leaving League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLeavingLeague(null);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, [user]);

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Leagues</h1>
            <p className="text-gray-600 mb-6">
              Create or join leagues to compete with your friends!
            </p>
            
            <div className="flex space-x-4">
              <CreateLeagueDialog onLeagueCreated={fetchLeagues} />
              <JoinLeagueDialog onLeagueJoined={fetchLeagues} />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-leagues">My Leagues ({myLeagues.length})</TabsTrigger>
              <TabsTrigger value="public-leagues">Public Leagues ({publicLeagues.length})</TabsTrigger>
              <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-leagues" className="mt-6">
              {isLoading ? (
                <LoadingSpinner message="Loading your leagues..." />
              ) : myLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You haven't joined any leagues yet.</p>
                  <p className="text-sm text-gray-500">Create a new league or join an existing one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myLeagues.map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      onLeave={handleLeaveLeague}
                      isLeaving={leavingLeague === league.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="public-leagues" className="mt-6">
              {isLoading ? (
                <LoadingSpinner message="Loading public leagues..." />
              ) : publicLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No public leagues available.</p>
                  <p className="text-sm text-gray-500">Create the first public league for others to join!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicLeagues.map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      onJoin={handleJoinLeague}
                      isJoining={joiningLeague === league.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboards" className="mt-6">
              {console.log('Leaderboards tab active, myLeagues:', myLeagues)}
              {isLoading ? (
                <LoadingSpinner message="Loading leaderboards..." />
              ) : myLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Join a league to view leaderboards.</p>
                  <p className="text-sm text-gray-500">Create or join a league to see how you rank against other members!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {myLeagues.map((league) => {
                    console.log('Rendering leaderboard for league:', league.name);
                    return (
                      <LeagueLeaderboard
                        key={league.id}
                        leagueId={league.id}
                        leagueName={league.name}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Leagues;
