
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

export const useWeeklyStandings = () => {
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: LeagueStanding[] }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGlobalStandings = async () => {
    try {
      // Get the global standings data (where league_id is NULL)
      const { data: standingsData, error: standingsError } = await supabase
        .from('standings')
        .select('*')
        .is('league_id', null)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (standingsError) throw standingsError;

      // Get all user IDs from standings
      const userIds = standingsData.map(standing => standing.user_id);

      // Fetch profile data for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      const formattedStandings: UserStanding[] = standingsData.map(standing => {
        const profile = profilesMap.get(standing.user_id);
        return {
          id: standing.id,
          userId: standing.user_id,
          totalPoints: standing.total_points,
          correctPicks: standing.correct_picks,
          totalPicks: standing.total_picks,
          currentRank: standing.current_rank,
          username: profile?.username,
          name: profile?.name,
        };
      });

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
      // Get the league standings data (where league_id matches)
      const { data: standingsData, error: standingsError } = await supabase
        .from('standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (standingsError) throw standingsError;

      // Get all user IDs from standings
      const userIds = standingsData.map(standing => standing.user_id);

      // Fetch profile data for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      const formattedStandings: LeagueStanding[] = standingsData.map(standing => {
        const profile = profilesMap.get(standing.user_id);
        return {
          id: standing.id,
          user_id: standing.user_id,
          total_points: standing.total_points,
          correct_picks: standing.correct_picks,
          total_picks: standing.total_picks,
          current_rank: standing.current_rank,
          league_id: standing.league_id,
          username: profile?.username,
          name: profile?.name,
        };
      });

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

    // Initial load only - no real-time subscriptions
    const loadData = async () => {
      setLoading(true);
      await loadGlobalStandings();
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    userStandings,
    leagueStandings,
    loading,
    loadLeagueStandings,
    loadGlobalStandings
  };
};

// Keep the old export name for backward compatibility
export const useRealtimeStandings = useWeeklyStandings;
