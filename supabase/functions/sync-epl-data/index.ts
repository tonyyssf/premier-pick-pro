
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
  id: number;
  name: string;
  shortName?: string;
  logo?: string;
}

interface EPLFixture {
  id: number;
  date: string;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  homeScore?: number;
  awayScore?: number;
  status: string;
}

// Add delay between API calls to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromRapidAPI(endpoint: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  console.log(`Fetching from endpoint: ${endpoint}`);
  console.log(`Using API key: ${rapidApiKey.substring(0, 8)}...`);
  
  const response = await fetch(`https://english-premiere-league1.p.rapidapi.com/${endpoint}`, {
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'english-premiere-league1.p.rapidapi.com'
    }
  });
  
  console.log(`Response status: ${response.status}`);
  console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API request failed with status ${response.status}: ${errorText}`);
    
    if (response.status === 403) {
      throw new Error(`API access denied (403). Please check: 1) Your RapidAPI subscription is active for the "English Premiere League" API, 2) Your API key is correct, 3) You have sufficient quota remaining. Error: ${errorText}`);
    } else if (response.status === 429) {
      throw new Error(`Rate limit exceeded (429). Please wait before making more requests. Error: ${errorText}`);
    } else if (response.status === 404) {
      throw new Error(`Endpoint not found (404). This endpoint may not exist in the English Premiere League API. Error: ${errorText}`);
    } else {
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
  }
  
  const data = await response.json();
  console.log(`Received data structure:`, JSON.stringify(data, null, 2));
  
  return data;
}

async function syncTeams() {
  console.log('Starting teams sync...');
  
  try {
    // Try to fetch teams using the likely endpoints for this API
    let teamsData;
    const possibleEndpoints = [
      'clubs',  // Most likely based on other Premier League APIs
      'teams',
      'team/list'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        teamsData = await fetchFromRapidAPI(endpoint);
        
        // Add delay between API calls to avoid rate limiting
        await delay(1000);
        
        if (teamsData && (Array.isArray(teamsData) || teamsData.clubs || teamsData.teams || teamsData.data)) {
          console.log(`Successfully fetched data from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${endpoint}:`, error.message);
        
        // Add delay even on errors to avoid rate limiting
        await delay(1000);
        
        if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
          throw new Error(`All team endpoints failed. The API structure may be different than expected. Last error: ${error.message}`);
        }
      }
    }
    
    if (!teamsData) {
      throw new Error('No team data received from any endpoint');
    }
    
    // Parse teams data based on structure
    let teams = [];
    if (Array.isArray(teamsData)) {
      teams = teamsData;
    } else if (teamsData.clubs) {
      teams = teamsData.clubs;
    } else if (teamsData.teams) {
      teams = teamsData.teams;
    } else if (teamsData.data) {
      teams = Array.isArray(teamsData.data) ? teamsData.data : [teamsData.data];
    }
    
    console.log(`Parsed ${teams.length} teams from response`);
    
    if (teams.length === 0) {
      throw new Error('No teams found in API response. The API may return data in a different format.');
    }
    
    let successCount = 0;
    for (const teamData of teams) {
      try {
        // Adapt to different team data structures
        const team = teamData.team || teamData;
        
        if (!team.id || !team.name) {
          console.log(`Skipping invalid team data:`, teamData);
          continue;
        }
        
        console.log(`Upserting team: ${team.name} (ID: ${team.id})`);
        
        const { error } = await supabase
          .from('teams')
          .upsert({
            id: team.id.toString(),
            name: team.name,
            short_name: team.shortName || team.short_name || team.code || team.name.slice(0, 3).toUpperCase(),
            logo_url: team.logo || team.logo_url || team.logoUrl || ''
          }, {
            onConflict: 'id'
          });
          
        if (error) {
          console.error(`Error upserting team ${team.name}:`, error);
        } else {
          successCount++;
        }
        
        // Add delay between database operations
        await delay(100);
      } catch (error) {
        console.error(`Error processing team:`, teamData, error);
      }
    }
    
    console.log(`Teams sync completed: ${successCount} teams synced successfully`);
    return { message: `Successfully synced ${successCount} teams`, count: successCount };
  } catch (error) {
    console.error('Error in syncTeams:', error);
    throw error;
  }
}

async function syncGameweeksAndFixtures() {
  console.log('Starting gameweeks and fixtures sync...');
  
  try {
    // Try to fetch fixtures using likely endpoints
    let fixturesData;
    const possibleEndpoints = [
      'fixtures', 
      'matches',
      'match/list',
      'fixture/list'
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying fixtures endpoint: ${endpoint}`);
        fixturesData = await fetchFromRapidAPI(endpoint);
        
        // Add delay between API calls
        await delay(1000);
        
        if (fixturesData && (Array.isArray(fixturesData) || fixturesData.fixtures || fixturesData.matches || fixturesData.data)) {
          console.log(`Successfully fetched fixtures from ${endpoint}`);
          break;
        }
      } catch (error) {
        console.log(`Failed to fetch fixtures from ${endpoint}:`, error.message);
        
        // Add delay even on errors
        await delay(1000);
        
        if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
          throw new Error(`All fixture endpoints failed. The API structure may be different than expected. Last error: ${error.message}`);
        }
      }
    }
    
    if (!fixturesData) {
      throw new Error('No fixture data received from any endpoint');
    }
    
    // Parse fixtures data
    let fixtures = [];
    if (Array.isArray(fixturesData)) {
      fixtures = fixturesData;
    } else if (fixturesData.fixtures) {
      fixtures = fixturesData.fixtures;
    } else if (fixturesData.matches) {
      fixtures = fixturesData.matches;
    } else if (fixturesData.data) {
      fixtures = Array.isArray(fixturesData.data) ? fixturesData.data : [fixturesData.data];
    }
    
    console.log(`Parsed ${fixtures.length} fixtures from response`);
    
    if (fixtures.length === 0) {
      throw new Error('No fixtures found in API response. The API may return data in a different format.');
    }
    
    // Group fixtures by rounds (gameweeks) - simplified approach
    const gameweeksMap = new Map<string, any[]>();
    
    for (const fixture of fixtures) {
      try {
        // Adapt to different fixture data structures
        const fixtureDate = new Date(fixture.date || fixture.kickoffTime || fixture.fixture?.date);
        const weekNumber = Math.ceil((fixtureDate.getTime() - new Date('2024-08-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
        const gameweekKey = `Gameweek ${Math.max(1, Math.min(38, weekNumber))}`;
        
        if (!gameweeksMap.has(gameweekKey)) {
          gameweeksMap.set(gameweekKey, []);
        }
        gameweeksMap.get(gameweekKey)!.push(fixture);
      } catch (error) {
        console.log(`Error processing fixture date:`, fixture, error);
      }
    }
    
    let gameweekNumber = 1;
    let totalFixtures = 0;
    
    for (const [gameweekName, gameweekFixtures] of gameweeksMap) {
      if (gameweekNumber > 38) break;
      
      const sortedFixtures = gameweekFixtures.sort((a, b) => {
        const dateA = new Date(a.date || a.kickoffTime || a.fixture?.date);
        const dateB = new Date(b.date || b.kickoffTime || b.fixture?.date);
        return dateA.getTime() - dateB.getTime();
      });
      
      if (sortedFixtures.length === 0) continue;
      
      try {
        const startDate = new Date(sortedFixtures[0].date || sortedFixtures[0].kickoffTime || sortedFixtures[0].fixture?.date);
        const endDate = new Date(sortedFixtures[sortedFixtures.length - 1].date || sortedFixtures[sortedFixtures.length - 1].kickoffTime || sortedFixtures[sortedFixtures.length - 1].fixture?.date);
        const deadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
        
        console.log(`Creating gameweek ${gameweekNumber} with ${sortedFixtures.length} fixtures`);
        
        const { data: gameweek, error: gameweekError } = await supabase
          .from('gameweeks')
          .upsert({
            number: gameweekNumber,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            deadline: deadline.toISOString(),
            is_current: gameweekNumber === 1
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
          try {
            const fixtureId = fixture.id || fixture.fixture?.id;
            const homeTeam = fixture.homeTeam || fixture.teams?.home;
            const awayTeam = fixture.awayTeam || fixture.teams?.away;
            const homeScore = fixture.homeScore || fixture.goals?.home || fixture.score?.home;
            const awayScore = fixture.awayScore || fixture.goals?.away || fixture.score?.away;
            const status = fixture.status || fixture.fixture?.status?.short || 'scheduled';
            
            if (!fixtureId || !homeTeam?.id || !awayTeam?.id) {
              console.log(`Skipping invalid fixture:`, fixture);
              continue;
            }
            
            const fixtureStatus = status === 'FT' || status === 'finished' ? 'finished' : 
                                status === 'LIVE' || status === 'live' ? 'live' : 'scheduled';
            
            console.log(`Creating fixture: ${homeTeam.name} vs ${awayTeam.name}`);
            
            const { error: fixtureError } = await supabase
              .from('fixtures')
              .upsert({
                id: fixtureId.toString(),
                gameweek_id: gameweek.id,
                home_team_id: homeTeam.id.toString(),
                away_team_id: awayTeam.id.toString(),
                kickoff_time: fixture.date || fixture.kickoffTime || fixture.fixture?.date,
                home_score: homeScore,
                away_score: awayScore,
                status: fixtureStatus
              }, {
                onConflict: 'id'
              });
              
            if (fixtureError) {
              console.error(`Error creating fixture:`, fixtureError);
            } else {
              totalFixtures++;
            }
            
            // Add delay between database operations
            await delay(100);
          } catch (error) {
            console.error(`Error processing fixture:`, fixture, error);
          }
        }
        
        gameweekNumber++;
        
        // Add delay between gameweeks
        await delay(500);
      } catch (error) {
        console.error(`Error processing gameweek ${gameweekNumber}:`, error);
      }
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
        console.log('Starting full sync with delays between operations...');
        const teamsResult = await syncTeams();
        
        // Add longer delay between teams and fixtures sync
        console.log('Waiting 3 seconds before syncing fixtures...');
        await delay(3000);
        
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
