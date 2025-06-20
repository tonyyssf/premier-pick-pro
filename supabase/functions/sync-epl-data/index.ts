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
  
  // Updated to use the correct English Premiere League API
  const response = await fetch(`https://english-premier-league1.p.rapidapi.com/${endpoint}`, {
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'english-premier-league1.p.rapidapi.com'
    }
  });
  
  console.log(`Response status: ${response.status}`);
  console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API request failed with status ${response.status}: ${errorText}`);
    
    // Check for specific error types
    if (response.status === 403) {
      throw new Error(`API access denied (403). Please check: 1) Your RapidAPI subscription is active, 2) You have access to the "English Premiere League" service, 3) Your API key is correct. Error: ${errorText}`);
    } else if (response.status === 429) {
      throw new Error(`Rate limit exceeded (429). Please wait before making more requests. Error: ${errorText}`);
    } else {
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
  }
  
  const data = await response.json();
  console.log(`Received data:`, JSON.stringify(data, null, 2));
  
  // Check if the API returned an error in the response body
  if (data.errors && data.errors.length > 0) {
    throw new Error(`API returned errors: ${JSON.stringify(data.errors)}`);
  }
  
  return data;
}

async function syncTeams() {
  console.log('Starting teams sync...');
  
  try {
    // Updated endpoint for English Premiere League API - try different potential endpoints
    let teamsData;
    const possibleEndpoints = [
      'teams',
      'clubs', 
      'v1/teams',
      'v1/clubs'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        teamsData = await fetchFromRapidAPI(endpoint);
        if (teamsData && (teamsData.teams || teamsData.clubs || teamsData.data || Array.isArray(teamsData))) {
          console.log(`Successfully fetched data from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${endpoint}:`, error.message);
        if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
          throw error; // Re-throw if this was the last endpoint to try
        }
      }
    }
    
    // Adapt to different response structures
    let teams = [];
    if (teamsData.teams) {
      teams = teamsData.teams;
    } else if (teamsData.clubs) {
      teams = teamsData.clubs;
    } else if (teamsData.data) {
      teams = teamsData.data;
    } else if (Array.isArray(teamsData)) {
      teams = teamsData;
    }
    
    console.log(`Fetched ${teams.length} teams`);
    
    if (teams.length === 0) {
      throw new Error('No teams returned from API. Please check your subscription includes Premier League data.');
    }
    
    for (const teamData of teams) {
      // Adapt to different team data structures
      const team = teamData.team || teamData;
      
      console.log(`Upserting team: ${team.name} (ID: ${team.id})`);
      
      const { error } = await supabase
        .from('teams')
        .upsert({
          id: team.id.toString(),
          name: team.name,
          short_name: team.code || team.short_name || team.name.slice(0, 3).toUpperCase(),
          logo_url: team.logo || team.logo_url || ''
        }, {
          onConflict: 'id'
        });
        
      if (error) {
        console.error(`Error upserting team ${team.name}:`, error);
        throw error;
      }
    }
    
    console.log('Teams sync completed successfully');
    return { message: `Successfully synced ${teams.length} teams`, count: teams.length };
  } catch (error) {
    console.error('Error in syncTeams:', error);
    throw error;
  }
}

async function syncGameweeksAndFixtures() {
  console.log('Starting gameweeks and fixtures sync...');
  
  try {
    // Updated endpoints for English Premiere League API
    let fixturesData;
    const possibleEndpoints = [
      'fixtures',
      'matches',
      'v1/fixtures',
      'v1/matches'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying fixtures endpoint: ${endpoint}`);
        fixturesData = await fetchFromRapidAPI(endpoint);
        if (fixturesData && (fixturesData.fixtures || fixturesData.matches || fixturesData.data || Array.isArray(fixturesData))) {
          console.log(`Successfully fetched fixtures from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch fixtures from ${endpoint}:`, error.message);
        if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
          throw error;
        }
      }
    }
    
    // Adapt to different response structures
    let fixtures = [];
    if (fixturesData.fixtures) {
      fixtures = fixturesData.fixtures;
    } else if (fixturesData.matches) {
      fixtures = fixturesData.matches;
    } else if (fixturesData.data) {
      fixtures = fixturesData.data;
    } else if (Array.isArray(fixturesData)) {
      fixtures = fixturesData;
    }
    
    console.log(`Fetched ${fixtures.length} fixtures`);
    
    if (fixtures.length === 0) {
      throw new Error('No fixtures returned from API. Please check your subscription includes Premier League fixtures.');
    }
    
    // Group fixtures by rounds (gameweeks)
    const gameweeksMap = new Map<string, any[]>();
    
    for (const fixture of fixtures) {
      // Adapt to different fixture data structures
      const fixtureDate = new Date(fixture.fixture?.date || fixture.date || fixture.kickoff_time);
      const weekNumber = Math.ceil((fixtureDate.getTime() - new Date('2024-08-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
      const gameweekKey = `Gameweek ${Math.max(1, Math.min(38, weekNumber))}`;
      
      if (!gameweeksMap.has(gameweekKey)) {
        gameweeksMap.set(gameweekKey, []);
      }
      gameweeksMap.get(gameweekKey)!.push(fixture);
    }
    
    // Create gameweeks and fixtures
    let gameweekNumber = 1;
    let totalFixtures = 0;
    
    for (const [gameweekName, gameweekFixtures] of gameweeksMap) {
      if (gameweekNumber > 38) break; // Premier League has 38 gameweeks
      
      // Sort fixtures by date
      const sortedFixtures = gameweekFixtures.sort((a, b) => {
        const dateA = new Date(a.fixture?.date || a.date || a.kickoff_time);
        const dateB = new Date(b.fixture?.date || b.date || b.kickoff_time);
        return dateA.getTime() - dateB.getTime();
      });
      
      if (sortedFixtures.length === 0) continue;
      
      const startDate = new Date(sortedFixtures[0].fixture?.date || sortedFixtures[0].date || sortedFixtures[0].kickoff_time);
      const endDate = new Date(sortedFixtures[sortedFixtures.length - 1].fixture?.date || sortedFixtures[sortedFixtures.length - 1].date || sortedFixtures[sortedFixtures.length - 1].kickoff_time);
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
        // Adapt to different fixture structures
        const fixtureId = fixture.fixture?.id || fixture.id;
        const homeTeam = fixture.teams?.home || fixture.home_team;
        const awayTeam = fixture.teams?.away || fixture.away_team;
        const goals = fixture.goals || fixture.score;
        const status = fixture.fixture?.status?.short || fixture.status;
        
        const fixtureStatus = status === 'FT' ? 'finished' : 
                            status === 'LIVE' ? 'live' : 'scheduled';
        
        console.log(`Creating fixture: ${homeTeam.name} vs ${awayTeam.name}`);
        
        const { error: fixtureError } = await supabase
          .from('fixtures')
          .upsert({
            id: fixtureId.toString(),
            gameweek_id: gameweek.id,
            home_team_id: homeTeam.id.toString(),
            away_team_id: awayTeam.id.toString(),
            kickoff_time: fixture.fixture?.date || fixture.date || fixture.kickoff_time,
            home_score: goals?.home,
            away_score: goals?.away,
            status: fixtureStatus
          }, {
            onConflict: 'id'
          });
          
        if (fixtureError) {
          console.error(`Error creating fixture:`, fixtureError);
        } else {
          totalFixtures++;
        }
      }
      
      gameweekNumber++;
    }
    
    console.log('Gameweeks and fixtures sync completed successfully');
    return { message: `Successfully synced ${gameweekNumber - 1} gameweeks and ${totalFixtures} fixtures`, gameweeks: gameweekNumber - 1, fixtures: totalFixtures };
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
    
    let result;
    
    switch (action) {
      case 'sync-teams':
        result = await syncTeams();
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'sync-fixtures':
        result = await syncGameweeksAndFixtures();
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'sync-all':
        const teamsResult = await syncTeams();
        const fixturesResult = await syncGameweeksAndFixtures();
        return new Response(JSON.stringify({ 
          success: true, 
          message: `${teamsResult.message}. ${fixturesResult.message}`,
          teams: teamsResult.count,
          gameweeks: fixturesResult.gameweeks,
          fixtures: fixturesResult.fixtures
        }), {
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
