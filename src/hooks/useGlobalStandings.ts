
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { standingsService } from '@/services/standingsService';
import type { UserStanding } from '@/types/standings';

export const useGlobalStandings = () => {
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const { toast } = useToast();

  const loadGlobalStandings = useCallback(async () => {
    try {
      // First cleanup any duplicate global standings
      await standingsService.cleanupDuplicateGlobalStandings();
      
      // Then load the clean standings
      const standings = await standingsService.fetchGlobalStandings();
      setUserStandings(standings);
    } catch (error: any) {
      console.error('Error loading global standings:', error);
      toast({
        title: "Error Loading Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    userStandings,
    setUserStandings,
    loadGlobalStandings
  };
};
