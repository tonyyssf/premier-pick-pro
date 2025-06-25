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
      console.log('Loading global standings...');
      
      // Get the global standings data (where league_id is NULL)
      const { data: standingsData, error: standingsError } = await supabase
        .from('standings')
        .select('*')
        .is('league_id', null)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (standingsError) throw standingsError;

      console.log('Raw global standings data:', standingsData);

      // Check for duplicate user entries
      const userIds = standingsData.map(s => s.user_id);
      const uniqueUserIds = [...new Set(userIds)];
      if (userIds.length !== uniqueUserIds.length) {
        console.error('Duplicate user entries found in global standings!', {
          totalEntries: userIds.length,
          uniqueUsers: uniqueUserIds.length,
          duplicates: userIds.filter((id, index) => userIds.indexOf(id) !== index)
        });
        
        toast({
          title: "Data Integrity Issue",
          description: "Duplicate entries detected in global standings. Please refresh rankings.",
          variant: "destructive",
        });
      }

      // Get all user IDs from standings
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name')
        .in('id', uniqueUserIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Filter out duplicates by keeping only the first occurrence of each user_id
      const deduplicatedStandings = standingsData.filter((standing, index, arr) => 
        arr.findIndex(s => s.user_id === standing.user_id) === index
      );

      console.log(`Filtered ${standingsData.length - deduplicatedStandings.length} duplicate entries`);

      const formattedStandings: UserStanding[] = deduplicatedStandings.map(standing => {
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

      // Ensure the data is sorted correctly to display proper rankings
      const sortedStandings = formattedStandings.sort((a, b) => {
        // Sort by rank (ascending, with null ranks at the end)
        if (a.currentRank === null && b.currentRank === null) return 0;
        if (a.currentRank === null) return 1;
        if (b.currentRank === null) return -1;
        return a.currentRank - b.currentRank;
      });

      console.log('Final formatted global standings:', sortedStandings);
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

      // Sort by rank (ascending, with null ranks at the end)
      const sortedStandings = formattedStandings.sort((a, b) => {
        if (a.current_rank === null && b.current_rank === null) return 0;
        if (a.current_rank === null) return 1;
        if (b.current_rank === null) return -1;
        return a.current_rank - b.current_rank;
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

    // Initial load with automatic refresh
    const loadDataWithRefresh = async () => {
      setLoading(true);
      
      // First refresh all rankings to ensure they're correct
      try {
        console.log('Refreshing rankings on component mount...');
        const { error: refreshError } = await supabase.rpc('refresh_all_rankings');
        if (refreshError) {
          console.error('Error refreshing rankings:', refreshError);
        } else {
          console.log('Rankings refreshed successfully');
        }
      } catch (error) {
        console.error('Error during initial refresh:', error);
      }
      
      // Then load the standings
      await loadGlobalStandings();
      setLoading(false);
    };

    loadDataWithRefresh();
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
