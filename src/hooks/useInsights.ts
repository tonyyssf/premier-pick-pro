import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InsightsData {
  heatmap: Array<{
    team: string;
    winProbability: number;
  }>;
  efficiency: Array<{
    gameweek: number;
    pointsEarned: number;
    maxPossible: number;
    efficiency: number;
  }>;
  projections: {
    p25: number;
    p50: number;
    p75: number;
    currentPoints: number;
    averagePerGameweek: number;
  };
  remainingTokens?: Record<string, number>;
  currentGameweek: number;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  winRate: number;
}

export function useInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['insights', user?.id],
    queryFn: async (): Promise<InsightsData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('rpc_get_insights', {
        target_user_id: user.id
      });

      if (error) {
        console.error('Error fetching insights:', error);
        throw new Error(`Failed to fetch insights data: ${error.message}`);
      }

      return data as unknown as InsightsData;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}