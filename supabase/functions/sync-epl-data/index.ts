
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
  console.log('Starting teams sync for 2025/26 Premier League season...');
  
  try {
    // First, clear existing teams to avoid duplicates
    console.log('Clearing existing teams...');
    const { error: clearError } = await supabase
      .from('teams')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all teams
    
    if (clearError) {
      console.error('Error clearing teams:', clearError);
    }
    
    // Try to fetch teams using the likely endpoints for this API
    let teamsData;
    const possibleEndpoints = [
      'team/list',  // Most likely based on successful team sync
      'clubs',
      'teams'
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
    
    // Filter to only include Premier League teams
    const premierLeagueTeams = teams.filter(teamData => {
      const team = teamData.team || teamData;
      const teamName = team.name || team.displayName || '';
      const isPL = isPremierLeagueTeam(teamName);
      
      if (isPL) {
        console.log(`Including Premier League team: ${teamName}`);
      } else {
        console.log(`Excluding non-Premier League team: ${teamName}`);
      }
      
      return isPL;
    });
    
    console.log(`Filtered to ${premierLeagueTeams.length} Premier League teams`);
    
    if (premierLeagueTeams.length === 0) {
      throw new Error('No Premier League teams found in API response after filtering.');
    }
    
    let successCount = 0;
    for (const teamData of premierLeagueTeams) {
      try {
        // Adapt to different team data structures
        const team = teamData.team || teamData;
        
        if (!team.id || !team.name) {
          console.log(`Skipping invalid team data:`, teamData);
          continue;
        }
        
        console.log(`Upserting Premier League team: ${team.name} (ID: ${team.id})`);
        
        // Generate consistent UUID for team ID
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
        
        // Add delay between database operations
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

async function syncGameweeksAndFixtures() {
  console.log('Starting gameweeks and fixtures sync for 2025/26 Premier League season...');
  
  try {
    // First, clear existing gameweeks and fixtures
    console.log('Clearing existing fixtures and gameweeks...');
    await supabase.from('fixtures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('gameweeks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Fetch schedule for 2025/26 season
    console.log(`Fetching schedule for 2025/26 Premier League season...`);
    
    let scheduleData;
    const possibleYears = [2025, 2026];
    
    for (const year of possibleYears) {
      try {
        console.log(`Trying to fetch schedule for year: ${year}`);
        scheduleData = await fetchFromRapidAPI(`schedule?year=${year}`);
        
        if (scheduleData && (scheduleData.schedule || scheduleData.fixtures || scheduleData.matches || Array.isArray(scheduleData))) {
          console.log(`Successfully fetched schedule data for year ${year}`);
          break;
        }
        
        // Add delay between attempts
        await delay(2000);
      } catch (error) {
        console.log(`Failed to fetch schedule for year ${year}:`, error.message);
        await delay(2000);
      }
    }
    
    if (!scheduleData) {
      throw new Error('No schedule data received from API for 2025/26 season');
    }
    
    console.log(`Received schedule data structure:`, JSON.stringify(scheduleData, null, 2));
    
    // Parse fixtures data based on the actual API response structure
    let allFixtures = [];
    
    if (scheduleData.schedule && typeof scheduleData.schedule === 'object') {
      // The schedule is an object with date keys containing arrays of fixtures
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
    
    console.log(`Parsed ${allFixtures.length} fixtures from response`);
    
    if (allFixtures.length === 0) {
      throw new Error('No fixtures found in API response. The API may return data in a different format.');
    }
    
    // Filter fixtures to only include Premier League teams
    const premierLeagueFixtures = allFixtures.filter(fixture => {
      try {
        // Handle different team data structures
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
        
        const isHomeTeamPL = isPremierLeagueTeam(homeTeamName);
        const isAwayTeamPL = isPremierLeagueTeam(awayTeamName);
        
        const isValidPLFixture = isHomeTeamPL && isAwayTeamPL;
        
        if (isValidPLFixture) {
          console.log(`Including Premier League fixture: ${homeTeamName} vs ${awayTeamName}`);
        } else {
          console.log(`Excluding non-Premier League fixture: ${homeTeamName} vs ${awayTeamName}`);
        }
        
        return isValidPLFixture;
      } catch (error) {
        console.log(`Error filtering fixture:`, fixture, error);
        return false;
      }
    });
    
    console.log(`Filtered to ${premierLeagueFixtures.length} Premier League fixtures`);
    
    if (premierLeagueFixtures.length === 0) {
      throw new Error('No Premier League fixtures found after filtering.');
    }
    
    // Group fixtures by rounds (gameweeks) based on date
    const gameweeksMap = new Map<string, any[]>();
    
    for (const fixture of premierLeagueFixtures) {
      try {
        // Extract fixture date from various possible fields
        const fixtureDate = new Date(fixture.date || fixture.kickoffTime || fixture.fixture?.date || fixture.startTime);
        
        // Calculate gameweek number based on the start of the 2025/26 season (August 2025)
        const seasonStart = new Date('2025-08-15'); // Typical Premier League season start
        const weekNumber = Math.ceil((fixtureDate.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const gameweekNumber = Math.max(1, Math.min(38, weekNumber));
        const gameweekKey = `Gameweek ${gameweekNumber}`;
        
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
        const dateA = new Date(a.date || a.kickoffTime || a.fixture?.date || a.startTime);
        const dateB = new Date(b.date || b.kickoffTime || b.fixture?.date || b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
      
      if (sortedFixtures.length === 0) continue;
      
      try {
        const startDate = new Date(sortedFixtures[0].date || sortedFixtures[0].kickoffTime || sortedFixtures[0].fixture?.date || sortedFixtures[0].startTime);
        const endDate = new Date(sortedFixtures[sortedFixtures.length - 1].date || sortedFixtures[sortedFixtures.length - 1].kickoffTime || sortedFixtures[sortedFixtures.length - 1].fixture?.date || sortedFixtures[sortedFixtures.length - 1].startTime);
        const deadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
        
        console.log(`Creating gameweek ${gameweekNumber} with ${sortedFixtures.length} Premier League fixtures`);
        
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
            
            // Handle different team data structures
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
            
            // Handle scores
            let homeScore, awayScore;
            if (fixture.competitors && Array.isArray(fixture.competitors)) {
              homeScore = fixture.competitors.find(team => team.isHome === true)?.score;
              awayScore = fixture.competitors.find(team => team.isHome === false)?.score;
            } else {
              homeScore = fixture.homeScore || fixture.goals?.home || fixture.score?.home;
              awayScore = fixture.awayScore || fixture.goals?.away || fixture.score?.away;
            }
            
            // Handle status
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
            
            console.log(`Creating Premier League fixture: ${homeTeam.name || homeTeam.displayName} vs ${awayTeam.name || awayTeam.displayName}`);
            
            // Generate consistent UUIDs for fixture and team IDs
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
    
    console.log('Premier League gameweeks and fixtures sync completed successfully');
    return { message: `Successfully synced ${gameweekNumber - 1} gameweeks and ${totalFixtures} Premier League fixtures`, gameweeks: gameweekNumber - 1, fixtures: totalFixtures };
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
        console.log('Starting full Premier League 2025/26 sync with delays between operations...');
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
