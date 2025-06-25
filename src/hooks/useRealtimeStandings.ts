import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { standingsService } from '@/services/standingsService';
import { useGlobalStandings } from './useGlobalStandings';
import { useLeagueStandings } from './useLeagueStandings';

export const useWeeklyStandings = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { userStandings, loadGlobalStandings } = useGlobalStandings();
  const { leagueStandings, loadLeagueStandings } = useLeagueStandings();

  useEffect(() => {
    if (!user) return;

    // Initial load with automatic refresh
    const loadDataWithRefresh = async () => {
      setLoading(true);
      
      // First refresh all rankings to ensure they're correct
      try {
        await standingsService.refreshAllRankings();
      } catch (error) {
        console.error('Error during initial refresh:', error);
        toast({
          title: "Error Refreshing Rankings",
          description: "There was an issue refreshing the rankings. Please try again later.",
          variant: "destructive",
        });
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
