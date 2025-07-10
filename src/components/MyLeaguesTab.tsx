
import React, { useState, useEffect } from 'react';
import { LeagueCard } from '@/components/LeagueCard';
import { CreateLeagueDialog } from '@/components/CreateLeagueDialog';
import { JoinLeagueDialog } from '@/components/JoinLeagueDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { League } from '@/types/league';

export const MyLeaguesTab: React.FC = () => {
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leavingLeague, setLeavingLeague] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeagues = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      // Fetch only leagues user is a member of - simplified query
      const { data: userLeagues, error: userLeaguesError } = await supabase
        .from('leagues')
        .select(`
          id,
          name,
          description,
          creator_id,
          invite_code,
          max_members,
          created_at
        `)
        .in('id', 
          await supabase
            .from('league_members')
            .select('league_id')
            .eq('user_id', user.id)
            .then(({ data }) => data?.map(m => m.league_id) || [])
        );

      if (userLeaguesError) throw userLeaguesError;

      if (!userLeagues || userLeagues.length === 0) {
        setMyLeagues([]);
        return;
      }

      // Get member counts for user's leagues
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
      console.log('Fetched user leagues:', processedUserLeagues);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Leagues</h2>
        <p className="text-gray-600 mb-6">
          Create a new league or join an existing one using an invite code. All leagues have a maximum of 20 members.
        </p>
        
        <div className="flex justify-center space-x-4">
          <CreateLeagueDialog onLeagueCreated={fetchLeagues} />
          <JoinLeagueDialog onLeagueJoined={fetchLeagues} />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your leagues..." />
      ) : myLeagues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't joined any leagues yet.</p>
          <p className="text-sm text-gray-500">Create a new league or join an existing one using an invite code to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myLeagues.map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              onLeave={handleLeaveLeague}
              onLeagueUpdated={fetchLeagues}
              isLeaving={leavingLeague === league.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
