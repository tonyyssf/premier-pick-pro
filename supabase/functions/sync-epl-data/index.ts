
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

// Current 2025/26 Premier League teams (official 20 teams)
const PREMIER_LEAGUE_TEAMS_2025_26 = [
  'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
  'Liverpool', 'Luton Town', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sheffield United', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
];

// Add delay between API calls to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate proper UUID from integer ID using crypto namespace
function generateUUIDFromId(id: number, prefix: string = 'fixture'): string {
  // Create a deterministic seed from the ID and prefix
  const seed = `${prefix}-${id}`;
  
  // Use a simple hash to create deterministic bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
  }
  
  // Convert to positive number and create UUID-like format
  const positiveHash = Math.abs(hash);
  const hashStr = positiveHash.toString(16).padStart(8, '0');
  
  // Create a proper UUID format (8-4-4-4-12)
  const uuid = `${hashStr.slice(0, 8)}-${hashStr.slice(0, 4)}-4${hashStr.slice(1, 4)}-8${hashStr.slice(4, 7)}-${hashStr.padEnd(12, '0').slice(0, 12)}`;
  
  return uuid;
}

// Helper function to check if a team name is a Premier League team
function isPremierLeagueTeam(teamName: string): boolean {
  return PREMIER_LEAGUE_TEAMS_2025_26.some(plTeam => 
    teamName.toLowerCase().includes(plTeam.toLowerCase()) || 
    plTeam.toLowerCase().includes(teamName.toLowerCase())
  );
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
      throw new Error(`API access denied (403). Please check your RapidAPI subscription and API key. Error: ${errorText}`);
    } else if (response.status === 429) {
      throw new Error(`Rate limit exceeded (429). Please wait before making more requests. Error: ${errorText}`);
    } else {
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
  }
  
  const data = await response.json();
  console.log(`Received data:`, JSON.stringify(data, null, 2));
  
  return data;
}

async function syncTeams() {
  console.log('Starting teams sync for 20 Premier League teams...');
  
  try {
    // Clear existing teams to avoid duplicates
    console.log('Clearing existing teams...');
    const { error: clearError } = await supabase
      .from('teams')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearError) {
      console.error('Error clearing teams:', clearError);
    }
    
    // Fetch teams data
    const teamsData = await fetchFromRapidAPI('team/list');
    await delay(1000);
    
    if (!teamsData) {
      throw new Error('No team data received from API');
    }
    
    // Parse teams data
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
    
    console.log(`Found ${teams.length} teams in API response`);
    
    // Filter to only Premier League teams and prevent duplicates
    const premierLeagueTeams = teams.filter(teamData => {
      const team = teamData.team || teamData;
      const teamName = team.name || team.displayName || '';
      return isPremierLeagueTeam(teamName);
    });
    
    console.log(`Filtered to ${premierLeagueTeams.length} Premier League teams`);
    
    // Remove duplicates by team ID
    const uniqueTeams = premierLeagueTeams.reduce((acc, teamData) => {
      const team = teamData.team || teamData;
      const teamId = team.id;
      
      if (!acc.find(t => (t.team || t).id === teamId)) {
        acc.push(teamData);
      }
      return acc;
    }, []);
    
    console.log(`After removing duplicates: ${uniqueTeams.length} unique Premier League teams`);
    
    if (uniqueTeams.length === 0) {
      throw new Error('No Premier League teams found in API response after filtering.');
    }
    
    let successCount = 0;
    for (const teamData of uniqueTeams) {
      try {
        const team = teamData.team || teamData;
        
        if (!team.id || !team.name) {
          console.log(`Skipping invalid team data:`, teamData);
          continue;
        }
        
        console.log(`Upserting Premier League team: ${team.name} (ID: ${team.id})`);
        
        const teamId = generateUUIDFromId(team.id, 'team');
        
        const { error } = await supabase
          .from('teams')
          .upsert({
            id: teamId,
            name: team.name || team.displayName,
            short_name: team.shortName || team.short_name || team.abbreviation || team.code || team.name.slice(0, 3).toUpperCase(),
            logo_url: team.logo || team.logo_url || team.logoUrl || (team.logos && team.logos[0]) || ''
          }, {
            onConflict: 'id'
          });
          
        if (error) {
          console.error(`Error upserting team ${team.name}:`, error);
        } else {
          successCount++;
        }
        
        await delay(100);
      } catch (error) {
        console.error(`Error processing team:`, teamData, error);
      }
    }
    
    console.log(`Teams sync completed: ${successCount} Premier League teams synced successfully`);
    return { message: `Successfully synced ${successCount} Premier League teams`, count: successCount };
  } catch (error) {
    console.error('Error in syncTeams:', error);
    throw error;
  }
}

async function syncFirstGameweek() {
  console.log('Starting sync for ONLY the first gameweek...');
  
  try {
    // Clear existing gameweeks and fixtures
    console.log('Clearing existing fixtures and gameweeks...');
    await supabase.from('fixtures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('gameweeks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Fetch schedule data
    console.log(`Fetching schedule for 2025/26 Premier League season...`);
    const scheduleData = await fetchFromRapidAPI('schedule?year=2025');
    
    if (!scheduleData) {
      throw new Error('No schedule data received from API');
    }
    
    console.log(`Received schedule data structure:`, JSON.stringify(scheduleData, null, 2));
    
    // Parse fixtures data
    let allFixtures = [];
    
    if (scheduleData.schedule && typeof scheduleData.schedule === 'object') {
      for (const [dateKey, dayFixtures] of Object.entries(scheduleData.schedule)) {
        if (Array.isArray(dayFixtures)) {
          allFixtures.push(...dayFixtures);
        }
      }
    } else if (Array.isArray(scheduleData)) {
      allFixtures = scheduleData;
    } else if (scheduleData.fixtures && Array.isArray(scheduleData.fixtures)) {
      allFixtures = scheduleData.fixtures;
    } else if (scheduleData.matches && Array.isArray(scheduleData.matches)) {
      allFixtures = scheduleData.matches;
    } else if (scheduleData.data && Array.isArray(scheduleData.data)) {
      allFixtures = scheduleData.data;
    }
    
    console.log(`Found ${allFixtures.length} total fixtures`);
    
    // Filter to only Premier League fixtures
    const premierLeagueFixtures = allFixtures.filter(fixture => {
      try {
        let homeTeam, awayTeam;
        if (fixture.competitors && Array.isArray(fixture.competitors)) {
          homeTeam = fixture.competitors.find(team => team.isHome === true);
          awayTeam = fixture.competitors.find(team => team.isHome === false);
        } else if (fixture.teams) {
          homeTeam = fixture.teams.home || fixture.teams[1];
          awayTeam = fixture.teams.away || fixture.teams[0];
        } else {
          homeTeam = fixture.homeTeam;
          awayTeam = fixture.awayTeam;
        }
        
        const homeTeamName = homeTeam?.name || homeTeam?.displayName || '';
        const awayTeamName = awayTeam?.name || awayTeam?.displayName || '';
        
        return isPremierLeagueTeam(homeTeamName) && isPremierLeagueTeam(awayTeamName);
      } catch (error) {
        console.log(`Error filtering fixture:`, fixture, error);
        return false;
      }
    });
    
    console.log(`Filtered to ${premierLeagueFixtures.length} Premier League fixtures`);
    
    if (premierLeagueFixtures.length === 0) {
      throw new Error('No Premier League fixtures found after filtering.');
    }
    
    // Sort fixtures by date to get the earliest ones (first gameweek)
    const sortedFixtures = premierLeagueFixtures.sort((a, b) => {
      const dateA = new Date(a.date || a.kickoffTime || a.fixture?.date || a.startTime);
      const dateB = new Date(b.date || b.kickoffTime || b.fixture?.date || b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Take only the first 10 fixtures for the first gameweek
    const firstGameweekFixtures = sortedFixtures.slice(0, 10);
    console.log(`Taking first ${firstGameweekFixtures.length} fixtures for gameweek 1`);
    
    if (firstGameweekFixtures.length === 0) {
      throw new Error('No fixtures found for the first gameweek.');
    }
    
    // Create gameweek 1
    const startDate = new Date(firstGameweekFixtures[0].date || firstGameweekFixtures[0].kickoffTime || firstGameweekFixtures[0].fixture?.date || firstGameweekFixtures[0].startTime);
    const endDate = new Date(firstGameweekFixtures[firstGameweekFixtures.length - 1].date || firstGameweekFixtures[firstGameweekFixtures.length - 1].kickoffTime || firstGameweekFixtures[firstGameweekFixtures.length - 1].fixture?.date || firstGameweekFixtures[firstGameweekFixtures.length - 1].startTime);
    const deadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
    
    console.log(`Creating gameweek 1 with ${firstGameweekFixtures.length} fixtures`);
    
    const { data: gameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .upsert({
        number: 1,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        deadline: deadline.toISOString(),
        is_current: true
      }, {
        onConflict: 'number'
      })
      .select()
      .single();
    
    if (gameweekError || !gameweek) {
      throw new Error(`Error creating gameweek: ${gameweekError?.message}`);
    }
    
    // Create fixtures for gameweek 1
    let fixtureCount = 0;
    for (const fixture of firstGameweekFixtures) {
      try {
        const fixtureId = fixture.id || fixture.fixture?.id;
        
        let homeTeam, awayTeam;
        if (fixture.competitors && Array.isArray(fixture.competitors)) {
          homeTeam = fixture.competitors.find(team => team.isHome === true);
          awayTeam = fixture.competitors.find(team => team.isHome === false);
        } else if (fixture.teams) {
          homeTeam = fixture.teams.home || fixture.teams[1];
          awayTeam = fixture.teams.away || fixture.teams[0];
        } else {
          homeTeam = fixture.homeTeam;
          awayTeam = fixture.awayTeam;
        }
        
        let homeScore, awayScore;
        if (fixture.competitors && Array.isArray(fixture.competitors)) {
          homeScore = fixture.competitors.find(team => team.isHome === true)?.score;
          awayScore = fixture.competitors.find(team => team.isHome === false)?.score;
        } else {
          homeScore = fixture.homeScore || fixture.goals?.home || fixture.score?.home;
          awayScore = fixture.awayScore || fixture.goals?.away || fixture.score?.away;
        }
        
        let status = 'scheduled';
        if (fixture.completed === true || fixture.status?.detail === 'FT' || fixture.status === 'FT') {
          status = 'finished';
        } else if (fixture.status?.state === 'in' || fixture.status === 'LIVE') {
          status = 'live';
        }
        
        if (!fixtureId || !homeTeam?.id || !awayTeam?.id) {
          console.log(`Skipping invalid fixture:`, fixture);
          continue;
        }
        
        console.log(`Creating fixture: ${homeTeam.name || homeTeam.displayName} vs ${awayTeam.name || awayTeam.displayName}`);
        
        const fixtureUuid = generateUUIDFromId(fixtureId, 'fixture');
        const homeTeamUuid = generateUUIDFromId(homeTeam.id, 'team');
        const awayTeamUuid = generateUUIDFromId(awayTeam.id, 'team');
        
        const { error: fixtureError } = await supabase
          .from('fixtures')
          .upsert({
            id: fixtureUuid,
            gameweek_id: gameweek.id,
            home_team_id: homeTeamUuid,
            away_team_id: awayTeamUuid,
            kickoff_time: fixture.date || fixture.kickoffTime || fixture.fixture?.date || fixture.startTime,
            home_score: homeScore,
            away_score: awayScore,
            status: status
          }, {
            onConflict: 'id'
          });
          
        if (fixtureError) {
          console.error(`Error creating fixture:`, fixtureError);
        } else {
          fixtureCount++;
        }
        
        await delay(100);
      } catch (error) {
        console.error(`Error processing fixture:`, fixture, error);
      }
    }
    
    console.log(`First gameweek sync completed: ${fixtureCount} fixtures created`);
    return { message: `Successfully synced gameweek 1 with ${fixtureCount} fixtures`, gameweeks: 1, fixtures: fixtureCount };
  } catch (error) {
    console.error('Error in syncFirstGameweek:', error);
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
        result = await syncFirstGameweek();
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'sync-all':
        console.log('Starting sync of 20 Premier League teams and first gameweek only...');
        const teamsResult = await syncTeams();
        
        console.log('Waiting 3 seconds before syncing first gameweek...');
        await delay(3000);
        
        const fixturesResult = await syncFirstGameweek();
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
