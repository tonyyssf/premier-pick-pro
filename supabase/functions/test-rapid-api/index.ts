
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

// Function to verify user authentication and admin privileges
async function verifyAdminAccess(authHeader: string | null): Promise<{ user: any; isAdmin: boolean }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error('Invalid authentication token');
  }

  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError) {
    console.error('Error checking user role:', roleError);
    throw new Error('Unable to verify user permissions');
  }

  const isAdmin = userRole?.role === 'admin';
  
  if (!isAdmin) {
    throw new Error('Insufficient privileges. Admin access required.');
  }

  return { user, isAdmin };
}

async function fetchFromRapidAPI(endpoint: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  console.log(`Fetching from endpoint: ${endpoint}`);
  
  const response = await fetch(`https://english-premiere-league1.p.rapidapi.com/${endpoint}`, {
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'english-premiere-league1.p.rapidapi.com'
    }
  });
  
  console.log(`Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API request failed with status ${response.status}: ${errorText}`);
    
    if (response.status === 403) {
      throw new Error(`API access denied (403). Please check your RapidAPI subscription and API key.`);
    } else if (response.status === 429) {
      throw new Error(`Rate limit exceeded (429). Please wait before making more requests.`);
    } else {
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
  }
  
  const data = await response.json();
  console.log(`Received data structure:`, Object.keys(data));
  
  return data;
}

async function testScheduleAPI() {
  console.log('Testing schedule API...');
  
  try {
    // Test current season schedule
    const scheduleData = await fetchFromRapidAPI('schedule?year=2025');
    
    if (!scheduleData) {
      throw new Error('No schedule data received from API');
    }

    // Parse the structure
    let allFixtures = [];
    let dataStructure = {};
    
    if (scheduleData.schedule && typeof scheduleData.schedule === 'object') {
      dataStructure = {
        type: 'schedule_object',
        keys: Object.keys(scheduleData.schedule),
        totalDays: Object.keys(scheduleData.schedule).length
      };
      
      for (const [dateKey, dayFixtures] of Object.entries(scheduleData.schedule)) {
        if (Array.isArray(dayFixtures)) {
          allFixtures.push(...dayFixtures);
        }
      }
    } else if (Array.isArray(scheduleData)) {
      dataStructure = {
        type: 'array',
        length: scheduleData.length
      };
      allFixtures = scheduleData;
    } else if (scheduleData.fixtures && Array.isArray(scheduleData.fixtures)) {
      dataStructure = {
        type: 'fixtures_array',
        length: scheduleData.fixtures.length
      };
      allFixtures = scheduleData.fixtures;
    }

    // Analyze first few fixtures for structure
    const sampleFixtures = allFixtures.slice(0, 5).map(fixture => {
      return {
        id: fixture.id || fixture.fixture?.id || 'no_id',
        date: fixture.date || fixture.kickoffTime || fixture.fixture?.date || fixture.startTime || 'no_date',
        homeTeam: fixture.competitors?.[0]?.name || fixture.teams?.home?.name || fixture.homeTeam?.name || 'no_home',
        awayTeam: fixture.competitors?.[1]?.name || fixture.teams?.away?.name || fixture.awayTeam?.name || 'no_away',
        status: fixture.status || fixture.completed || 'no_status',
        venue: fixture.venue || fixture.location || 'no_venue',
        availableFields: Object.keys(fixture)
      };
    });

    return {
      success: true,
      dataStructure,
      totalFixtures: allFixtures.length,
      sampleFixtures,
      message: `Successfully fetched ${allFixtures.length} fixtures from Rapid API`
    };

  } catch (error) {
    console.error('Error testing schedule API:', error);
    throw error;
  }
}

async function testTeamsAPI() {
  console.log('Testing teams API...');
  
  try {
    const teamsData = await fetchFromRapidAPI('team/list');
    
    if (!teamsData) {
      throw new Error('No teams data received from API');
    }

    // Parse teams data structure
    let teams = [];
    let dataStructure = {};
    
    if (Array.isArray(teamsData)) {
      dataStructure = { type: 'array', length: teamsData.length };
      teams = teamsData;
    } else if (teamsData.clubs) {
      dataStructure = { type: 'clubs_object', length: teamsData.clubs.length };
      teams = teamsData.clubs;
    } else if (teamsData.teams) {
      dataStructure = { type: 'teams_object', length: teamsData.teams.length };
      teams = teamsData.teams;
    } else if (teamsData.data) {
      dataStructure = { type: 'data_object', length: Array.isArray(teamsData.data) ? teamsData.data.length : 1 };
      teams = Array.isArray(teamsData.data) ? teamsData.data : [teamsData.data];
    }

    // Analyze first few teams for structure
    const sampleTeams = teams.slice(0, 5).map(teamData => {
      const team = teamData.team || teamData;
      return {
        id: team.id || 'no_id',
        name: team.name || team.displayName || 'no_name',
        shortName: team.shortName || team.short_name || team.abbreviation || team.code || 'no_short_name',
        logo: team.logo || team.logo_url || team.logoUrl || 'no_logo',
        availableFields: Object.keys(team)
      };
    });

    return {
      success: true,
      dataStructure,
      totalTeams: teams.length,
      sampleTeams,
      message: `Successfully fetched ${teams.length} teams from Rapid API`
    };

  } catch (error) {
    console.error('Error testing teams API:', error);
    throw error;
  }
}

async function compareWithCurrentData() {
  console.log('Comparing API data with current database...');
  
  try {
    // Get current gameweek
    const { data: currentGameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('is_current', true)
      .single();

    if (gameweekError || !currentGameweek) {
      throw new Error('No current gameweek found');
    }

    // Get current fixtures
    const { data: currentFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(name),
        away_team:teams!fixtures_away_team_id_fkey(name)
      `)
      .eq('gameweek_id', currentGameweek.id);

    if (fixturesError) {
      throw new Error('Could not fetch current fixtures');
    }

    // Get current teams
    const { data: currentTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      throw new Error('Could not fetch current teams');
    }

    return {
      success: true,
      currentData: {
        gameweek: currentGameweek,
        fixtures: currentFixtures?.length || 0,
        teams: currentTeams?.length || 0,
        fixturesSample: currentFixtures?.slice(0, 3).map(f => ({
          homeTeam: f.home_team?.name,
          awayTeam: f.away_team?.name,
          kickoffTime: f.kickoff_time,
          status: f.status
        }))
      },
      message: `Current database has ${currentTeams?.length || 0} teams and ${currentFixtures?.length || 0} fixtures for gameweek ${currentGameweek.number}`
    };

  } catch (error) {
    console.error('Error comparing with current data:', error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get('authorization');
    const { user } = await verifyAdminAccess(authHeader);
    
    console.log(`Admin user ${user.email} testing Rapid API`);

    const { action } = await req.json();
    console.log(`Received test request for action: ${action}`);
    
    let result;
    
    switch (action) {
      case 'test-schedule':
        result = await testScheduleAPI();
        break;
        
      case 'test-teams':
        result = await testTeamsAPI();
        break;
        
      case 'compare-data':
        result = await compareWithCurrentData();
        break;
        
      case 'test-all':
        const scheduleResult = await testScheduleAPI();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        
        const teamsResult = await testTeamsAPI();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        
        const compareResult = await compareWithCurrentData();
        
        result = {
          success: true,
          schedule: scheduleResult,
          teams: teamsResult,
          comparison: compareResult,
          message: 'All API tests completed successfully'
        };
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Test API error:', error);
    
    let statusCode = 500;
    if (error.message.includes('Missing or invalid authorization') || 
        error.message.includes('Invalid authentication token')) {
      statusCode = 401;
    } else if (error.message.includes('Insufficient privileges')) {
      statusCode = 403;
    }
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.toString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
