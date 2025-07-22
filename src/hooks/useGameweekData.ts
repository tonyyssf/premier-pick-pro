
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gameweek, Fixture } from '@/types/picks';

export const useGameweekData = () => {
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [viewingGameweek, setViewingGameweek] = useState<Gameweek | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);

  const loadCurrentGameweek = async () => {
    try {
      console.log('Loading current gameweek...');
      
      // First, try to get the current gameweek (marked as is_current = true)
      let { data: gameweekData, error: gameweekError } = await supabase
        .from('gameweeks')
        .select('*')
        .eq('is_current', true)
        .single();

      // If no current gameweek is found, default to gameweek 1
      if (gameweekError || !gameweekData) {
        console.log('No current gameweek found, defaulting to gameweek 1');
        const { data: gw1Data, error: gw1Error } = await supabase
          .from('gameweeks')
          .select('*')
          .eq('number', 1)
          .single();
          
        if (gw1Error) {
          console.error('Error loading gameweek 1:', gw1Error);
          return;
        }
        
        // Set gameweek 1 as current
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

      console.log('Current gameweek loaded:', gameweek);
      setCurrentGameweek(gameweek);
      setViewingGameweek(gameweek);

      return gameweek;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadGameweekByNumber = async (gameweekNumber: number): Promise<boolean> => {
    try {
      console.log('Loading gameweek by number:', gameweekNumber);
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
      
      // Load fixtures for the selected gameweek
      await loadFixturesForGameweek(gameweek.id);
      
      return true;
    } catch (error) {
      console.error('Error loading gameweek by number:', error);
      return false;
    }
  };

  const loadFixturesForGameweek = async (gameweekId: string) => {
    try {
      const { data: fixturesData, error: fixturesError } = await supabase.rpc(
        'get_app_fixtures_for_gameweek',
        { gw_id: gameweekId }
      );

      if (fixturesError) {
        console.error('Error loading fixtures:', fixturesError);
        return;
      }

      console.log('Fixtures loaded:', fixturesData?.length || 0, 'fixtures');

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

      // Sort fixtures by kickoff time (chronologically)
      const sortedFixtures = formattedFixtures.sort((a, b) => 
        a.kickoffTime.getTime() - b.kickoffTime.getTime()
      );

      setFixtures(sortedFixtures);
    } catch (error) {
      console.error('Error loading fixtures:', error);
    } finally {
      setFixturesLoading(false);
    }
  };

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
  }, []);

  return {
    currentGameweek,
    viewingGameweek,
    fixtures,
    fixturesLoading,
    loadCurrentGameweek,
    loadGameweekByNumber,
    setCurrentGameweek,
    setFixtures,
    setViewingGameweek
  };
};
