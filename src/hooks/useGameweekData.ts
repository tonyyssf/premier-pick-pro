
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gameweek, Fixture } from '@/types/picks';

export const useGameweekData = () => {
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
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

      // Load fixtures for current gameweek - UPDATED to include team_color and order by kickoff_time
      const { data: fixturesData, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(id, name, short_name, team_color),
          away_team:teams!fixtures_away_team_id_fkey(id, name, short_name, team_color)
        `)
        .eq('gameweek_id', gameweek.id)
        .order('kickoff_time', { ascending: true });

      if (fixturesError) {
        console.error('Error loading fixtures:', fixturesError);
        return;
      }

      console.log('Fixtures loaded:', fixturesData?.length || 0, 'fixtures');

      const formattedFixtures: Fixture[] = fixturesData.map(fixture => ({
        id: fixture.id,
        homeTeam: {
          id: fixture.home_team.id,
          name: fixture.home_team.name,
          shortName: fixture.home_team.short_name,
          teamColor: fixture.home_team.team_color,
        },
        awayTeam: {
          id: fixture.away_team.id,
          name: fixture.away_team.name,
          shortName: fixture.away_team.short_name,
          teamColor: fixture.away_team.team_color,
        },
        kickoffTime: new Date(fixture.kickoff_time),
        status: fixture.status,
      }));

      setFixtures(formattedFixtures);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFixturesLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentGameweek();
  }, []);

  return {
    currentGameweek,
    fixtures,
    fixturesLoading,
    loadCurrentGameweek,
    setCurrentGameweek,
    setFixtures
  };
};
