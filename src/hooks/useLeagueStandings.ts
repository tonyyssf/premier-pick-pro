
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { standingsService } from '@/services/standingsService';
import type { LeagueStanding } from '@/types/standings';

export const useLeagueStandings = () => {
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: LeagueStanding[] }>({});
  const { toast } = useToast();

  const loadLeagueStandings = useCallback(async (leagueId: string) => {
    try {
      const standings = await standingsService.fetchLeagueStandings(leagueId);
      setLeagueStandings(prev => ({
        ...prev,
        [leagueId]: standings
      }));
    } catch (error: any) {
      console.error('Error loading league standings:', error);
      toast({
        title: "Error Loading League Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    leagueStandings,
    setLeagueStandings,
    loadLeagueStandings
  };
};
