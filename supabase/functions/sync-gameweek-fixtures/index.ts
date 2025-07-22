
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

async function syncGameweekFixtures(gameweekNumber: number) {
  console.log(`Starting fixture sync for gameweek ${gameweekNumber}...`);
  
  try {
    // Get the gameweek from our database
    const { data: gameweekData, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('number', gameweekNumber)
      .single();

    if (gameweekError || !gameweekData) {
      throw new Error(`Gameweek ${gameweekNumber} not found in database`);
    }

    console.log(`Syncing gameweek ${gameweekData.number} (ID: ${gameweekData.id})`);

    // Fetch latest fixture data from API
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

    // Get existing fixtures for this gameweek from our database
    const { data: existingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('Round Number', gameweekNumber);

    if (fixturesError) {
      throw new Error('Could not fetch existing fixtures');
    }

    console.log(`Found ${existingFixtures?.length || 0} existing fixtures for gameweek ${gameweekNumber}`);

    let updatedCount = 0;
    let earliestKickoff: Date | null = null;

    // Update existing fixtures with accurate times from API
    for (const dbFixture of existingFixtures || []) {
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
            homeTeamName.toLowerCase().includes(dbFixture["Home Team"].toLowerCase()) ||
            dbFixture["Home Team"].toLowerCase().includes(homeTeamName.toLowerCase())
          ) && (
            awayTeamName.toLowerCase().includes(dbFixture["Away Team"].toLowerCase()) ||
            dbFixture["Away Team"].toLowerCase().includes(awayTeamName.toLowerCase())
          );
        });

        if (apiFixture) {
          let kickoffTime = null;
          
          // Extract kickoff time from API data
          if (apiFixture.date) {
            kickoffTime = new Date(apiFixture.date);
          } else if (apiFixture.kickoffTime) {
            kickoffTime = new Date(apiFixture.kickoffTime);
          } else if (apiFixture.fixture?.date) {
            kickoffTime = new Date(apiFixture.fixture.date);
          } else if (apiFixture.startTime) {
            kickoffTime = new Date(apiFixture.startTime);
          }

          if (kickoffTime && !isNaN(kickoffTime.getTime())) {
            // Format the date for our database
            const formattedDate = kickoffTime.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).replace(',', '');

            // Update the fixture with the new date/time
            const { error: updateError } = await supabase
              .from('fixtures')
              .update({ 'Date': formattedDate })
              .eq('Match Number', dbFixture['Match Number']);

            if (updateError) {
              console.error(`Error updating fixture ${dbFixture['Match Number']}:`, updateError);
            } else {
              updatedCount++;
              console.log(`Updated fixture: ${dbFixture["Home Team"]} vs ${dbFixture["Away Team"]} - ${formattedDate}`);
              
              // Track the earliest kickoff time
              if (!earliestKickoff || kickoffTime < earliestKickoff) {
                earliestKickoff = kickoffTime;
              }
            }
          }
        }

        await delay(100);
      } catch (error) {
        console.error(`Error processing fixture ${dbFixture['Match Number']}:`, error);
      }
    }

    // Update gameweek deadline to match the earliest fixture kickoff
    if (earliestKickoff && gameweekData.is_current) {
      console.log(`Updating gameweek ${gameweekNumber} deadline to: ${earliestKickoff.toISOString()}`);
      
      const { error: deadlineError } = await supabase
        .from('gameweeks')
        .update({ deadline: earliestKickoff.toISOString() })
        .eq('id', gameweekData.id);

      if (deadlineError) {
        console.error('Error updating gameweek deadline:', deadlineError);
      } else {
        console.log('Gameweek deadline updated successfully');
      }
    }

    console.log(`Fixture sync completed: ${updatedCount} fixtures updated for gameweek ${gameweekNumber}`);
    return { 
      message: `Successfully updated ${updatedCount} fixtures for gameweek ${gameweekNumber}`, 
      updated: updatedCount,
      earliestKickoff: earliestKickoff?.toISOString() || null
    };

  } catch (error) {
    console.error('Error in syncGameweekFixtures:', error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gameweekNumber } = await req.json();
    console.log(`Received sync request for gameweek: ${gameweekNumber}`);
    
    if (!gameweekNumber || typeof gameweekNumber !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid gameweek number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const result = await syncGameweekFixtures(gameweekNumber);
    
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
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
