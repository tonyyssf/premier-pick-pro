import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GameweekFixture {
  id: string;
  home_team_name: string;
  away_team_name: string;
  home_team_short_name: string;
  away_team_short_name: string;
  kickoff_time: string;
  status: string;
}

export function useFixturesByGameweek(gameweekNumber: number) {
  return useQuery({
    queryKey: ['fixtures-by-gameweek', gameweekNumber],
    queryFn: async (): Promise<GameweekFixture[]> => {
      // First get the gameweek ID
      const { data: gameweek, error: gameweekError } = await supabase
        .from('gameweeks')
        .select('id')
        .eq('number', gameweekNumber)
        .single();

      if (gameweekError || !gameweek) {
        console.error('Error fetching gameweek:', gameweekError);
        return [];
      }

      // Then get fixtures for that gameweek using the RPC function
      const { data, error } = await supabase.rpc('get_app_fixtures_for_gameweek', {
        gw_id: gameweek.id
      });

      if (error) {
        console.error('Error fetching fixtures:', error);
        throw new Error(`Failed to fetch fixtures: ${error.message}`);
      }

      return data || [];
    },
    enabled: gameweekNumber > 0 && gameweekNumber <= 38,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}