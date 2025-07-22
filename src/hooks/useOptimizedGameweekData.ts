
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gameweek, Fixture } from '@/types/picks';

// Cache for gameweek data
const gameweekCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for gameweek data

export const useOptimizedGameweekData = () => {
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [viewingGameweek, setViewingGameweek] = useState<Gameweek | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);

  // Memoized fixture loading to prevent unnecessary API calls
  const loadFixturesForGameweek = useCallback(async (gameweekId: string) => {
    const cacheKey = `fixtures-${gameweekId}`;
    const cached = gameweekCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setFixtures(cached.data);
      setFixturesLoading(false);
      return;
    }

    try {
      setFixturesLoading(true);
      const { data: fixturesData, error: fixturesError } = await supabase.rpc(
        'get_app_fixtures_for_gameweek',
        { gw_id: gameweekId }
      );

      if (fixturesError) {
        console.error('Error loading fixtures:', fixturesError);
        return;
      }

      const formattedFixtures: Fixture[] = fixturesData.map(fixture => ({
        id: fixture.id,
        homeTeam: {
          id: fixture.home_team_id,
          name: fixture.home_team_name,
          shortName: fixture.home_team_short_name,
          teamColor: fixture.home_team_color,
        },
        awayTeam: {
          id: fixture.away_team_id,
          name: fixture.away_team_name,
          shortName: fixture.away_team_short_name,
          teamColor: fixture.away_team_color,
        },
        kickoffTime: new Date(fixture.kickoff_time),
        status: fixture.status,
      }));

      const sortedFixtures = formattedFixtures.sort((a, b) => 
        a.kickoffTime.getTime() - b.kickoffTime.getTime()
      );

      setFixtures(sortedFixtures);
      gameweekCache.set(cacheKey, { data: sortedFixtures, timestamp: Date.now() });
    } catch (error) {
      console.error('Error loading fixtures:', error);
    } finally {
      setFixturesLoading(false);
    }
  }, []);

  const loadCurrentGameweek = useCallback(async () => {
    const cacheKey = 'current-gameweek';
    const cached = gameweekCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const gameweek = cached.data;
      setCurrentGameweek(gameweek);
      setViewingGameweek(gameweek);
      return gameweek;
    }

    try {
      console.log('Loading current gameweek...');
      
      let { data: gameweekData, error: gameweekError } = await supabase
        .from('gameweeks')
        .select('*')
        .eq('is_current', true)
        .single();

      if (gameweekError || !gameweekData) {
        const { data: gw1Data, error: gw1Error } = await supabase
          .from('gameweeks')
          .select('*')
          .eq('number', 1)
          .single();
          
        if (gw1Error) {
          console.error('Error loading gameweek 1:', gw1Error);
          return;
        }
        
        const { error: updateError } = await supabase
          .from('gameweeks')
          .update({ is_current: true })
          .eq('id', gw1Data.id);
          
        if (updateError) {
          console.error('Error setting gameweek 1 as current:', updateError);
        }
        
        gameweekData = gw1Data;
      }

      const gameweek: Gameweek = {
        id: gameweekData.id,
        number: gameweekData.number,
        deadline: new Date(gameweekData.deadline),
        isCurrent: gameweekData.is_current,
      };

      setCurrentGameweek(gameweek);
      setViewingGameweek(gameweek);
      gameweekCache.set(cacheKey, { data: gameweek, timestamp: Date.now() });

      return gameweek;
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const loadGameweekByNumber = useCallback(async (gameweekNumber: number): Promise<boolean> => {
    const cacheKey = `gameweek-${gameweekNumber}`;
    const cached = gameweekCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setViewingGameweek(cached.data);
      await loadFixturesForGameweek(cached.data.id);
      return true;
    }

    try {
      setFixturesLoading(true);

      const { data: gameweekData, error: gameweekError } = await supabase
        .from('gameweeks')
        .select('*')
        .eq('number', gameweekNumber)
        .single();

      if (gameweekError || !gameweekData) {
        console.error('Error loading gameweek:', gameweekError);
        return false;
      }

      const gameweek: Gameweek = {
        id: gameweekData.id,
        number: gameweekData.number,
        deadline: new Date(gameweekData.deadline),
        isCurrent: gameweekData.is_current,
      };

      setViewingGameweek(gameweek);
      gameweekCache.set(cacheKey, { data: gameweek, timestamp: Date.now() });
      
      await loadFixturesForGameweek(gameweek.id);
      
      return true;
    } catch (error) {
      console.error('Error loading gameweek by number:', error);
      return false;
    }
  }, [loadFixturesForGameweek]);

  useEffect(() => {
    const initializeData = async () => {
      const gameweek = await loadCurrentGameweek();
      if (gameweek) {
        await loadFixturesForGameweek(gameweek.id);
      } else {
        setFixturesLoading(false);
      }
    };
    
    initializeData();
  }, [loadCurrentGameweek, loadFixturesForGameweek]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    currentGameweek,
    viewingGameweek,
    fixtures,
    fixturesLoading,
    loadCurrentGameweek,
    loadGameweekByNumber,
    setCurrentGameweek,
    setFixtures,
    setViewingGameweek,
    clearCache: () => gameweekCache.clear()
  }), [
    currentGameweek,
    viewingGameweek,
    fixtures,
    fixturesLoading,
    loadCurrentGameweek,
    loadGameweekByNumber
  ]);
};
