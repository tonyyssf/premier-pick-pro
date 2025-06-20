
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

// Add delay between API calls to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  console.log(`Received data:`, JSON.stringify(data, null, 2));
  
  return data;
}

async function syncCurrentGameweek() {
  console.log('Starting current gameweek sync...');
  
  try {
    // Get the current gameweek from our database
    const { data: currentGameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('is_current', true)
      .single();

    if (gameweekError || !currentGameweek) {
      throw new Error('No current gameweek found in database');
    }

    console.log(`Syncing gameweek ${currentGameweek.number}`);

    // Get fixtures for current gameweek
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(name),
        away_team:teams!fixtures_away_team_id_fkey(name)
      `)
      .eq('gameweek_id', currentGameweek.id);

    if (fixturesError || !fixtures) {
      throw new Error('Could not fetch fixtures for current gameweek');
    }

    console.log(`Found ${fixtures.length} fixtures to sync`);

    // Fetch latest fixture data from API for this gameweek
    const scheduleData = await fetchFromRapidAPI('schedule?year=2025');
    await delay(1000);

    if (!scheduleData) {
      throw new Error('No schedule data received from API');
    }

    // Parse API fixtures
    let allFixtures = [];
    if (scheduleData.schedule && typeof scheduleData.schedule === 'object') {
      for (const [dateKey, dayFixtures] of Object.entries(scheduleData.schedule)) {
        if (Array.isArray(dayFixtures)) {
          allFixtures.push(...dayFixtures);
        }
      }
    } else if (Array.isArray(scheduleData)) {
      allFixtures = scheduleData;
    }

    console.log(`Found ${allFixtures.length} fixtures in API response`);

    let updatedCount = 0;

    // Update our fixtures with the latest data from API
    for (const dbFixture of fixtures) {
      try {
        // Find matching fixture in API data by team names
        const apiFixture = allFixtures.find(apiF => {
          let homeTeam, awayTeam;
          if (apiF.competitors && Array.isArray(apiF.competitors)) {
            homeTeam = apiF.competitors.find(team => team.isHome === true);
            awayTeam = apiF.competitors.find(team => team.isHome === false);
          } else if (apiF.teams) {
            homeTeam = apiF.teams.home || apiF.teams[1];
            awayTeam = apiF.teams.away || apiF.teams[0];
          }

          if (!homeTeam || !awayTeam) return false;

          const homeTeamName = homeTeam.name || homeTeam.displayName || '';
          const awayTeamName = awayTeam.name || awayTeam.displayName || '';

          return (
            homeTeamName.toLowerCase().includes(dbFixture.home_team.name.toLowerCase()) ||
            dbFixture.home_team.name.toLowerCase().includes(homeTeamName.toLowerCase())
          ) && (
            awayTeamName.toLowerCase().includes(dbFixture.away_team.name.toLowerCase()) ||
            dbFixture.away_team.name.toLowerCase().includes(awayTeamName.toLowerCase())
          );
        });

        if (apiFixture) {
          // Extract scores and status
          let homeScore, awayScore;
          if (apiFixture.competitors && Array.isArray(apiFixture.competitors)) {
            homeScore = apiFixture.competitors.find(team => team.isHome === true)?.score;
            awayScore = apiFixture.competitors.find(team => team.isHome === false)?.score;
          } else {
            homeScore = apiFixture.homeScore || apiFixture.goals?.home || apiFixture.score?.home;
            awayScore = apiFixture.awayScore || apiFixture.goals?.away || apiFixture.score?.away;
          }

          let status = 'scheduled';
          if (apiFixture.completed === true || apiFixture.status?.detail === 'FT' || apiFixture.status === 'FT') {
            status = 'finished';
          } else if (apiFixture.status?.state === 'in' || apiFixture.status === 'LIVE') {
            status = 'live';
          }

          // Update fixture with latest data
          const updates: any = {
            status: status,
            updated_at: new Date().toISOString()
          };

          // Update kickoff time if available
          if (apiFixture.date || apiFixture.kickoffTime || apiFixture.fixture?.date || apiFixture.startTime) {
            updates.kickoff_time = apiFixture.date || apiFixture.kickoffTime || apiFixture.fixture?.date || apiFixture.startTime;
          }

          // Update scores if match is finished
          if (status === 'finished' && homeScore !== undefined && awayScore !== undefined) {
            updates.home_score = homeScore;
            updates.away_score = awayScore;
          }

          const { error: updateError } = await supabase
            .from('fixtures')
            .update(updates)
            .eq('id', dbFixture.id);

          if (updateError) {
            console.error(`Error updating fixture ${dbFixture.id}:`, updateError);
          } else {
            updatedCount++;
            console.log(`Updated fixture: ${dbFixture.home_team.name} vs ${dbFixture.away_team.name}`);
          }
        }

        await delay(100);
      } catch (error) {
        console.error(`Error processing fixture ${dbFixture.id}:`, error);
      }
    }

    console.log(`Current gameweek sync completed: ${updatedCount} fixtures updated`);
    return { message: `Successfully updated ${updatedCount} fixtures for gameweek ${currentGameweek.number}`, updated: updatedCount };

  } catch (error) {
    console.error('Error in syncCurrentGameweek:', error);
    throw error;
  }
}

async function updateScores() {
  console.log('Starting score update...');
  
  try {
    // Get fixtures that might have been updated
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(name),
        away_team:teams!fixtures_away_team_id_fkey(name)
      `)
      .in('status', ['live', 'finished']);

    if (fixturesError) {
      throw new Error('Could not fetch fixtures');
    }

    if (!fixtures || fixtures.length === 0) {
      return { message: 'No fixtures found that need score updates', updated: 0 };
    }

    console.log(`Found ${fixtures.length} fixtures to check for score updates`);

    // Fetch latest data from API
    const scheduleData = await fetchFromRapidAPI('schedule?year=2025');
    await delay(1000);

    if (!scheduleData) {
      throw new Error('No schedule data received from API');
    }

    // Parse API fixtures
    let allFixtures = [];
    if (scheduleData.schedule && typeof scheduleData.schedule === 'object') {
      for (const [dateKey, dayFixtures] of Object.entries(scheduleData.schedule)) {
        if (Array.isArray(dayFixtures)) {
          allFixtures.push(...dayFixtures);
        }
      }
    } else if (Array.isArray(scheduleData)) {
      allFixtures = scheduleData;
    }

    let updatedCount = 0;

    for (const dbFixture of fixtures) {
      try {
        // Find matching fixture in API data
        const apiFixture = allFixtures.find(apiF => {
          let homeTeam, awayTeam;
          if (apiF.competitors && Array.isArray(apiF.competitors)) {
            homeTeam = apiF.competitors.find(team => team.isHome === true);
            awayTeam = apiF.competitors.find(team => team.isHome === false);
          } else if (apiF.teams) {
            homeTeam = apiF.teams.home || apiF.teams[1];
            awayTeam = apiF.teams.away || apiF.teams[0];
          }

          if (!homeTeam || !awayTeam) return false;

          const homeTeamName = homeTeam.name || homeTeam.displayName || '';
          const awayTeamName = awayTeam.name || awayTeam.displayName || '';

          return (
            homeTeamName.toLowerCase().includes(dbFixture.home_team.name.toLowerCase()) ||
            dbFixture.home_team.name.toLowerCase().includes(homeTeamName.toLowerCase())
          ) && (
            awayTeamName.toLowerCase().includes(dbFixture.away_team.name.toLowerCase()) ||
            dbFixture.away_team.name.toLowerCase().includes(awayTeamName.toLowerCase())
          );
        });

        if (apiFixture) {
          // Extract scores and status
          let homeScore, awayScore;
          if (apiFixture.competitors && Array.isArray(apiFixture.competitors)) {
            homeScore = apiFixture.competitors.find(team => team.isHome === true)?.score;
            awayScore = apiFixture.competitors.find(team => team.isHome === false)?.score;
          } else {
            homeScore = apiFixture.homeScore || apiFixture.goals?.home || apiFixture.score?.home;
            awayScore = apiFixture.awayScore || apiFixture.goals?.away || apiFixture.score?.away;
          }

          let status = 'scheduled';
          if (apiFixture.completed === true || apiFixture.status?.detail === 'FT' || apiFixture.status === 'FT') {
            status = 'finished';
          } else if (apiFixture.status?.state === 'in' || apiFixture.status === 'LIVE') {
            status = 'live';
          }

          // Check if we need to update
          const needsUpdate = 
            dbFixture.status !== status ||
            (status === 'finished' && (dbFixture.home_score !== homeScore || dbFixture.away_score !== awayScore));

          if (needsUpdate) {
            const updates: any = {
              status: status,
              updated_at: new Date().toISOString()
            };

            if (status === 'finished' && homeScore !== undefined && awayScore !== undefined) {
              updates.home_score = homeScore;
              updates.away_score = awayScore;
            }

            const { error: updateError } = await supabase
              .from('fixtures')
              .update(updates)
              .eq('id', dbFixture.id);

            if (updateError) {
              console.error(`Error updating fixture ${dbFixture.id}:`, updateError);
            } else {
              updatedCount++;
              console.log(`Updated scores: ${dbFixture.home_team.name} ${homeScore}-${awayScore} ${dbFixture.away_team.name}`);
            }
          }
        }

        await delay(100);
      } catch (error) {
        console.error(`Error processing fixture ${dbFixture.id}:`, error);
      }
    }

    console.log(`Score update completed: ${updatedCount} fixtures updated`);
    return { message: `Successfully updated scores for ${updatedCount} fixtures`, updated: updatedCount };

  } catch (error) {
    console.error('Error in updateScores:', error);
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
      case 'sync-current-gameweek':
        result = await syncCurrentGameweek();
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'update-scores':
        result = await updateScores();
        return new Response(JSON.stringify({ success: true, ...result }), {
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
