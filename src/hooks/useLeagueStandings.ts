
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { standingsService } from '@/services/standingsService';
import type { LeagueStanding } from '@/types/standings';

export const useLeagueStandings = () => {
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: LeagueStanding[] }>({});
  const { toast } = useToast();

  const loadLeagueStandings = async (leagueId: string) => {
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
  };

  return {
    leagueStandings,
    setLeagueStandings,
    loadLeagueStandings
  };
};
