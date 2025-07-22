
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedStandings } from './useOptimizedStandings';
import { performanceMonitor } from '@/utils/performanceMonitor';

export const useWeeklyStandings = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    userStandings, 
    leagueStandings, 
    loadGlobalStandings, 
    loadLeagueStandings 
  } = useOptimizedStandings();

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        await performanceMonitor.measureAsync('load-standings', async () => {
          await loadGlobalStandings();
        });
      } catch (error) {
        console.error('Error loading standings:', error);
        toast({
          title: "Error Loading Standings",
          description: "There was an issue loading the standings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, loadGlobalStandings, toast]);

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
