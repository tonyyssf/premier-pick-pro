import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

    const loadData = async () => {
      setLoading(true);
      try {
        await loadGlobalStandings();
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
