import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FixtureDifficultyData {
  team: string;
  difficulties: number[];
}

export interface ProcessedFixtureDifficulty {
  team: string;
  currentDifficulty: number;
  nextFiveGames: number[];
  averageDifficulty: number;
}

export function useFixtureDifficulty(currentGameweek: number = 1) {
  return useQuery({
    queryKey: ['fixture-difficulty', currentGameweek],
    queryFn: async (): Promise<{
      rawData: FixtureDifficultyData[];
      processedData: ProcessedFixtureDifficulty[];
    }> => {
      // Query the fixture difficulty data using the new RPC function
      const { data, error } = await supabase
        .rpc('get_fixture_difficulty_data') as { data: any[] | null, error: any };

      if (error) {
        throw new Error(`Failed to fetch fixture difficulty data: ${error.message}`);
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return { rawData: [], processedData: [] };
      }

      // Process raw data
      const rawData: FixtureDifficultyData[] = data.map((row: any) => {
        const difficulties: number[] = [];
        for (let i = 1; i <= 38; i++) {
          const gwKey = `gw${i}`;
          const difficulty = row[gwKey] as number;
          difficulties.push(difficulty || 3); // Default to 3 if null
        }
        return {
          team: row.team,
          difficulties
        };
      });

      // Process for current gameweek analysis
      const processedData: ProcessedFixtureDifficulty[] = rawData.map(teamData => {
        const currentDifficulty = teamData.difficulties[currentGameweek - 1] || 3;
        
        // Get next 5 games (or remaining games if less than 5)
        const nextFiveGames = teamData.difficulties
          .slice(currentGameweek - 1, currentGameweek + 4)
          .filter(d => d !== undefined);
        
        // Calculate average difficulty for remaining games
        const remainingGames = teamData.difficulties.slice(currentGameweek - 1);
        const averageDifficulty = remainingGames.length > 0 
          ? remainingGames.reduce((sum, diff) => sum + diff, 0) / remainingGames.length
          : 3;

        return {
          team: teamData.team,
          currentDifficulty,
          nextFiveGames,
          averageDifficulty: Math.round(averageDifficulty * 10) / 10
        };
      });

      return { rawData, processedData };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}