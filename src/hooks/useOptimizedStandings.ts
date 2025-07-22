
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { standingsService } from '@/services/standingsService';
import type { UserStanding, LeagueStanding } from '@/types/standings';

// Cache for standings data
const standingsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds (5 minutes for standings)
const STANDINGS_CACHE_TTL = 5 * 60 * 1000;

const getCachedData = (key: string) => {
  const cached = standingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  standingsCache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttl: number = STANDINGS_CACHE_TTL) => {
  standingsCache.set(key, { data, timestamp: Date.now(), ttl });
};

export const useOptimizedStandings = () => {
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: LeagueStanding[] }>({});
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Debounced loading function
  const loadGlobalStandings = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    const cacheKey = 'global-standings';
    const now = Date.now();
    
    // Prevent excessive API calls (minimum 30 seconds between requests)
    if (!forceRefresh && now - lastFetch < 30000) {
      return;
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setUserStandings(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      await standingsService.cleanupDuplicateGlobalStandings();
      const standings = await standingsService.fetchGlobalStandings();
      
      setUserStandings(standings);
      setCachedData(cacheKey, standings);
      setLastFetch(now);
    } catch (error: any) {
      console.error('Error loading global standings:', error);
      toast({
        title: "Error Loading Standings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, lastFetch]);

  const loadLeagueStandings = useCallback(async (leagueId: string, forceRefresh = false) => {
    const cacheKey = `league-standings-${leagueId}`;
    
    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setLeagueStandings(prev => ({
          ...prev,
          [leagueId]: cached
        }));
        return;
      }
    }

    try {
      const standings = await standingsService.fetchLeagueStandings(leagueId);
      setLeagueStandings(prev => ({
        ...prev,
        [leagueId]: standings
      }));
      setCachedData(cacheKey, standings);
    } catch (error: any) {
      console.error('Error loading league standings:', error);
      toast({
        title: "Error Loading League Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Memoized return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    userStandings,
    leagueStandings,
    loading,
    loadGlobalStandings,
    loadLeagueStandings,
    clearCache: () => standingsCache.clear()
  }), [userStandings, leagueStandings, loading, loadGlobalStandings, loadLeagueStandings]);

  return returnValue;
};
