
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserStanding {
  id: string;
  userId: string;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  currentRank: number | null;
  username?: string;
  name?: string;
}

interface LeagueStanding {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
  league_id: string;
  username?: string;
  name?: string;
}

export const useRealtimeStandings = () => {
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: LeagueStanding[] }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGlobalStandings = async () => {
    try {
      const { data: standingsData, error } = await supabase
        .from('user_standings')
        .select(`
          *,
          profiles!inner(username, name)
        `)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const formattedStandings: UserStanding[] = standingsData.map(standing => ({
        id: standing.id,
        userId: standing.user_id,
        totalPoints: standing.total_points,
        correctPicks: standing.correct_picks,
        totalPicks: standing.total_picks,
        currentRank: standing.current_rank,
        username: standing.profiles?.username,
        name: standing.profiles?.name,
      }));

      // Sort alphabetically by username when points and correct picks are tied
      const sortedStandings = formattedStandings.sort((a, b) => {
        // First sort by points (descending)
        if (a.totalPoints !== b.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        // Then by correct picks (descending)
        if (a.correctPicks !== b.correctPicks) {
          return b.correctPicks - a.correctPicks;
        }
        // Finally alphabetically by username
        const usernameA = a.username || a.name || `Player ${a.userId.slice(0, 8)}`;
        const usernameB = b.username || b.name || `Player ${b.userId.slice(0, 8)}`;
        return usernameA.localeCompare(usernameB);
      });

      setUserStandings(sortedStandings);
    } catch (error: any) {
      console.error('Error loading global standings:', error);
      toast({
        title: "Error Loading Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadLeagueStandings = async (leagueId: string) => {
    try {
      const { data: standingsData, error } = await supabase
        .from('league_standings')
        .select(`
          *,
          profiles!inner(username, name)
        `)
        .eq('league_id', leagueId)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const formattedStandings: LeagueStanding[] = standingsData.map(standing => ({
        id: standing.id,
        user_id: standing.user_id,
        total_points: standing.total_points,
        correct_picks: standing.correct_picks,
        total_picks: standing.total_picks,
        current_rank: standing.current_rank,
        league_id: standing.league_id,
        username: standing.profiles?.username,
        name: standing.profiles?.name,
      }));

      // Sort alphabetically by username when points and correct picks are tied
      const sortedStandings = formattedStandings.sort((a, b) => {
        // First sort by points (descending)
        if (a.total_points !== b.total_points) {
          return b.total_points - a.total_points;
        }
        // Then by correct picks (descending)
        if (a.correct_picks !== b.correct_picks) {
          return b.correct_picks - a.correct_picks;
        }
        // Finally alphabetically by username
        const usernameA = a.username || a.name || `Player ${a.user_id.slice(0, 8)}`;
        const usernameB = b.username || b.name || `Player ${b.user_id.slice(0, 8)}`;
        return usernameA.localeCompare(usernameB);
      });

      setLeagueStandings(prev => ({
        ...prev,
        [leagueId]: sortedStandings
      }));
    } catch (error: any) {
      console.error('Error loading league standings:', error);
      toast({
        title: "Error Loading League Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initial load
    const loadData = async () => {
      setLoading(true);
      await loadGlobalStandings();
      setLoading(false);
    };

    loadData();

    // Set up realtime subscription for global standings
    const globalChannel = supabase
      .channel('global-standings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_standings'
        },
        (payload) => {
          console.log('Global standings update:', payload);
          // Reload standings to get updated profile data
          loadGlobalStandings();

          // Show toast for current user's rank changes
          if (payload.new && payload.new.user_id === user.id && payload.eventType === 'UPDATE') {
            toast({
              title: "Your Rank Updated!",
              description: `You're now ranked #${payload.new.current_rank} with ${payload.new.total_points} points`,
            });
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for league standings
    const leagueChannel = supabase
      .channel('league-standings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'league_standings'
        },
        (payload) => {
          console.log('League standings update:', payload);
          
          if (payload.new) {
            const leagueId = payload.new.league_id;
            // Reload league standings to get updated profile data
            loadLeagueStandings(leagueId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(leagueChannel);
    };
  }, [user]);

  return {
    userStandings,
    leagueStandings,
    loading,
    loadLeagueStandings,
    loadGlobalStandings
  };
};
