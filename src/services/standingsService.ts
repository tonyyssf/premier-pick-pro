
import { supabase } from '@/integrations/supabase/client';
import type { UserStanding, LeagueStanding } from '@/types/standings';

export const standingsService = {
  async fetchGlobalStandings(): Promise<UserStanding[]> {
    console.log('Loading global standings...');
    
    // Get the global standings data (where league_id is NULL)
    const { data: standingsData, error: standingsError } = await supabase
      .from('standings')
      .select('*')
      .is('league_id', null)
      .order('current_rank', { ascending: true, nullsFirst: false });

    if (standingsError) throw standingsError;

    console.log('Raw global standings data:', standingsData);

    // Get all unique user IDs
    const uniqueUserIds = [...new Set(standingsData.map(s => s.user_id))];

    // Get user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, name')
      .in('id', uniqueUserIds);

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

    // Ensure the data is sorted correctly by rank
    const sortedStandings = formattedStandings.sort((a, b) => {
      // Sort by rank (ascending, with null ranks at the end)
      if (a.currentRank === null && b.currentRank === null) return 0;
      if (a.currentRank === null) return 1;
      if (b.currentRank === null) return -1;
      return a.currentRank - b.currentRank;
    });

    console.log('Final formatted global standings:', sortedStandings);
    return sortedStandings;
  },

  async fetchLeagueStandings(leagueId: string): Promise<LeagueStanding[]> {
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
    return formattedStandings.sort((a, b) => {
      if (a.current_rank === null && b.current_rank === null) return 0;
      if (a.current_rank === null) return 1;
      if (b.current_rank === null) return -1;
      return a.current_rank - b.current_rank;
    });
  },

  async refreshAllRankings(): Promise<void> {
    console.log('Refreshing rankings on component mount...');
    const { error: refreshError } = await supabase.rpc('refresh_all_rankings');
    if (refreshError) {
      console.error('Error refreshing rankings:', refreshError);
      throw refreshError;
    } else {
      console.log('Rankings refreshed successfully');
    }
  }
};
