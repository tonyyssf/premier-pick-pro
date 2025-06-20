
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EPLTeam {
  team: {
    id: number;
    name: string;
    code: string;
    logo: string;
  };
}

interface EPLFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

async function fetchFromRapidAPI(endpoint: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  console.log(`Fetching from endpoint: ${endpoint}`);
  console.log(`Using API key: ${rapidApiKey.substring(0, 8)}...`);
  
  const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`, {
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  });
  
  console.log(`Response status: ${response.status}`);
  console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API request failed with status ${response.status}: ${errorText}`);
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`Received data with ${data.response?.length || 0} items`);
  return data;
}

async function syncTeams() {
  console.log('Starting teams sync...');
  
  try {
    // Fetch teams from Premier League (league id: 39, season: 2024)
    const teamsData = await fetchFromRapidAPI('teams?league=39&season=2024');
    
    const teams = teamsData.response as EPLTeam[];
    console.log(`Fetched ${teams.length} teams`);
    
    for (const teamData of teams) {
      const { team } = teamData;
      
      console.log(`Upserting team: ${team.name} (ID: ${team.id})`);
      
      const { error } = await supabase
        .from('teams')
        .upsert({
          id: team.id.toString(),
          name: team.name,
          short_name: team.code || team.name.slice(0, 3).toUpperCase(),
          logo_url: team.logo
        }, {
          onConflict: 'id'
        });
        
      if (error) {
        console.error(`Error upserting team ${team.name}:`, error);
        throw error;
      }
    }
    
    console.log('Teams sync completed successfully');
  } catch (error) {
    console.error('Error in syncTeams:', error);
    throw error;
  }
}

async function syncGameweeksAndFixtures() {
  console.log('Starting gameweeks and fixtures sync...');
  
  try {
    // Fetch fixtures from Premier League
    const fixturesData = await fetchFromRapidAPI('fixtures?league=39&season=2024');
    const fixtures = fixturesData.response as EPLFixture[];
    
    console.log(`Fetched ${fixtures.length} fixtures`);
    
    // Group fixtures by rounds (gameweeks)
    const gameweeksMap = new Map<string, EPLFixture[]>();
    
    for (const fixture of fixtures) {
      // For Premier League, we'll create gameweeks based on fixture dates
      const fixtureDate = new Date(fixture.fixture.date);
      const weekNumber = Math.ceil((fixtureDate.getTime() - new Date('2024-08-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
      const gameweekKey = `Gameweek ${Math.max(1, Math.min(38, weekNumber))}`;
      
      if (!gameweeksMap.has(gameweekKey)) {
        gameweeksMap.set(gameweekKey, []);
      }
      gameweeksMap.get(gameweekKey)!.push(fixture);
    }
    
    // Create gameweeks and fixtures
    let gameweekNumber = 1;
    for (const [gameweekName, gameweekFixtures] of gameweeksMap) {
      if (gameweekNumber > 38) break; // Premier League has 38 gameweeks
      
      // Sort fixtures by date to get the first and last fixture dates
      const sortedFixtures = gameweekFixtures.sort((a, b) => 
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
      );
      
      if (sortedFixtures.length === 0) continue;
      
      const startDate = new Date(sortedFixtures[0].fixture.date);
      const endDate = new Date(sortedFixtures[sortedFixtures.length - 1].fixture.date);
      const deadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before first match
      
      console.log(`Creating gameweek ${gameweekNumber} with ${sortedFixtures.length} fixtures`);
      
      // Create or update gameweek
      const { data: gameweek, error: gameweekError } = await supabase
        .from('gameweeks')
        .upsert({
          number: gameweekNumber,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          deadline: deadline.toISOString(),
          is_current: gameweekNumber === 1 // Set first gameweek as current
        }, {
          onConflict: 'number'
        })
        .select()
        .single();
      
      if (gameweekError || !gameweek) {
        console.error('Error creating gameweek:', gameweekError);
        continue;
      }
      
      // Create fixtures for this gameweek
      for (const fixture of sortedFixtures) {
        const status = fixture.fixture.status.short === 'FT' ? 'finished' : 
                      fixture.fixture.status.short === 'LIVE' ? 'live' : 'scheduled';
        
        console.log(`Creating fixture: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        
        const { error: fixtureError } = await supabase
          .from('fixtures')
          .upsert({
            id: fixture.fixture.id.toString(),
            gameweek_id: gameweek.id,
            home_team_id: fixture.teams.home.id.toString(),
            away_team_id: fixture.teams.away.id.toString(),
            kickoff_time: fixture.fixture.date,
            home_score: fixture.goals.home,
            away_score: fixture.goals.away,
            status: status
          }, {
            onConflict: 'id'
          });
          
        if (fixtureError) {
          console.error(`Error creating fixture:`, fixtureError);
        }
      }
      
      gameweekNumber++;
    }
    
    console.log('Gameweeks and fixtures sync completed successfully');
  } catch (error) {
    console.error('Error in syncGameweeksAndFixtures:', error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log(`Received sync request for action: ${action}`);
    
    switch (action) {
      case 'sync-teams':
        await syncTeams();
        return new Response(JSON.stringify({ success: true, message: 'Teams synced successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'sync-fixtures':
        await syncGameweeksAndFixtures();
        return new Response(JSON.stringify({ success: true, message: 'Gameweeks and fixtures synced successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'sync-all':
        await syncTeams();
        await syncGameweeksAndFixtures();
        return new Response(JSON.stringify({ success: true, message: 'All data synced successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
