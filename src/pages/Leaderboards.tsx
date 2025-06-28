import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MobileLeaderboardView } from '@/components/MobileLeaderboardView';
import { LeaderboardTabs } from '@/components/LeaderboardTabs';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: any[] }>({});
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

          // Get league standings for the MobileLeaderboardView
          const { data: standings } = await supabase
            .from('standings')
            .select('*')
            .eq('league_id', league.id)
            .order('current_rank', { ascending: true, nullsFirst: false });

          if (standings) {
            // Get user profiles separately
            const userIds = standings.map(s => s.user_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, name')
              .in('id', userIds);

            const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

            const formattedStandings = standings.map(standing => ({
              ...standing,
              username: profilesMap.get(standing.user_id)?.username,
              name: profilesMap.get(standing.user_id)?.name,
            }));

            setLeagueStandings(prev => ({
              ...prev,
              [league.id]: formattedStandings
            }));
          }

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

  const handleToggleExpansion = (leagueId: string) => {
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

  const handleLeagueCreated = () => {
    fetchLeaguesWithRanks();
    toast({
      title: "Success",
      description: "League created successfully! Refreshing your leagues...",
    });
  };

  const handleLeagueJoined = () => {
    fetchLeaguesWithRanks();
    toast({
      title: "Success", 
      description: "Joined league successfully! Refreshing your leagues...",
    });
  };

  useEffect(() => {
    fetchLeaguesWithRanks();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-plpe-neutral-900">
        <div className="p-4 bg-plpe-gradient header">
          <h1 className="text-2xl font-bold text-plpe-white text-center">Leaderboard</h1>
        </div>
        
        {isMobile ? (
          <MobileLeaderboardView 
            leagueStandings={leagueStandings}
            leagues={leaguesWithRanks}
            selectedLeagueId={selectedLeagueId}
            onLeagueSelect={setSelectedLeagueId}
            onLeagueCreated={handleLeagueCreated}
            onLeagueJoined={handleLeagueJoined}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LeaderboardTabs
              leaguesWithRanks={leaguesWithRanks}
              isLoading={isLoading}
              expandedLeagues={expandedLeagues}
              onToggleExpansion={handleToggleExpansion}
              onRefreshNeeded={fetchLeaguesWithRanks}
              onLeagueCreated={handleLeagueCreated}
              onLeagueJoined={handleLeagueJoined}
            />
          </div>
        )}
        
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
};

export default Leaderboards;
