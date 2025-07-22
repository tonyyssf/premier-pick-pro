
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

    // Get existing fixtures for this gameweek from our database
    const { data: existingFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('Round Number', gameweekNumber);

    if (fixturesError) {
      throw new Error('Could not fetch existing fixtures');
    }

    console.log(`Found ${existingFixtures?.length || 0} existing fixtures for gameweek ${gameweekNumber}`);

    // For gameweek 1, use correct fixture dates for 2025/26 season based on database fixtures
    const gameweek1Fixtures = [
      { homeTeam: 'Liverpool', awayTeam: 'Bournemouth', date: '15/08/2025 20:00' }, // Friday evening - earliest game
      { homeTeam: 'Aston Villa', awayTeam: 'Newcastle', date: '16/08/2025 12:30' },
      { homeTeam: 'Brighton', awayTeam: 'Fulham', date: '16/08/2025 15:00' },
      { homeTeam: 'Nott\'m Forest', awayTeam: 'Brentford', date: '16/08/2025 17:30' },
      { homeTeam: 'Sunderland', awayTeam: 'West Ham', date: '17/08/2025 14:00' },
      { homeTeam: 'Spurs', awayTeam: 'Burnley', date: '17/08/2025 16:30' },
      { homeTeam: 'Wolves', awayTeam: 'Man City', date: '17/08/2025 14:00' },
      { homeTeam: 'Chelsea', awayTeam: 'Crystal Palace', date: '18/08/2025 16:30' },
      { homeTeam: 'Manchester United', awayTeam: 'Arsenal', date: '18/08/2025 14:00' },
      { homeTeam: 'Leeds', awayTeam: 'Everton', date: '18/08/2025 19:00' }
    ];

    let updatedCount = 0;
    let earliestKickoff: Date | null = null;

    // Update existing fixtures with gameweek 1 dates
    for (const dbFixture of existingFixtures || []) {
      try {
        // Find matching fixture in our predefined gameweek 1 data
        const matchingFixture = gameweek1Fixtures.find(gw1F => {
          const homeMatch = gw1F.homeTeam.toLowerCase().includes(dbFixture["Home Team"].toLowerCase()) ||
                            dbFixture["Home Team"].toLowerCase().includes(gw1F.homeTeam.toLowerCase());
          const awayMatch = gw1F.awayTeam.toLowerCase().includes(dbFixture["Away Team"].toLowerCase()) ||
                            dbFixture["Away Team"].toLowerCase().includes(gw1F.awayTeam.toLowerCase());
          
          return homeMatch && awayMatch;
        });

        if (matchingFixture) {
          const kickoffTime = parseDate(matchingFixture.date);
          
          if (kickoffTime && !isNaN(kickoffTime.getTime())) {
            // Update the fixture with the new date/time
            const { error: updateError } = await supabase
              .from('fixtures')
              .update({ 'Date': matchingFixture.date })
              .eq('Match Number', dbFixture['Match Number']);

            if (updateError) {
              console.error(`Error updating fixture ${dbFixture['Match Number']}:`, updateError);
            } else {
              updatedCount++;
              console.log(`Updated fixture: ${dbFixture["Home Team"]} vs ${dbFixture["Away Team"]} - ${matchingFixture.date}`);
              
              // Track the earliest kickoff time
              if (!earliestKickoff || kickoffTime < earliestKickoff) {
                earliestKickoff = kickoffTime;
              }
            }
          }
        } else {
          console.log(`No matching fixture found for: ${dbFixture["Home Team"]} vs ${dbFixture["Away Team"]}`);
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

// Helper function to parse date strings in DD/MM/YYYY HH:MM format
function parseDate(dateString: string): Date | null {
  try {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
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
