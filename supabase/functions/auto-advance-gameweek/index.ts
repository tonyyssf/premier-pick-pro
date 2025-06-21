
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Auto-advance gameweek function triggered');
    
    // Get the current gameweek
    const { data: currentGameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('is_current', true)
      .single();

    if (gameweekError || !currentGameweek) {
      console.log('No current gameweek found:', gameweekError);
      return new Response(JSON.stringify({ 
        message: 'No current gameweek found',
        error: gameweekError 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Checking gameweek ${currentGameweek.number} for completion`);

    // Check if all fixtures in current gameweek are finished
    const { data: isComplete, error: checkError } = await supabase.rpc('check_gameweek_completion', {
      gameweek_uuid: currentGameweek.id
    });

    if (checkError) {
      console.error('Error checking gameweek completion:', checkError);
      return new Response(JSON.stringify({ 
        error: 'Failed to check gameweek completion',
        details: checkError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isComplete) {
      console.log(`Gameweek ${currentGameweek.number} is not yet complete`);
      return new Response(JSON.stringify({ 
        message: `Gameweek ${currentGameweek.number} is not yet complete`,
        gameweek: currentGameweek.number,
        complete: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // All fixtures are finished, calculate scores first
    console.log(`All fixtures finished for gameweek ${currentGameweek.number}, calculating scores`);
    
    const { error: scoresError } = await supabase.rpc('calculate_gameweek_scores', {
      gameweek_uuid: currentGameweek.id
    });

    if (scoresError) {
      console.error('Error calculating scores:', scoresError);
      return new Response(JSON.stringify({ 
        error: 'Failed to calculate scores before advancing gameweek',
        details: scoresError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Scores calculated successfully, now advancing gameweek');

    // Advance to next gameweek
    const { error: advanceError } = await supabase.rpc('advance_to_next_gameweek');

    if (advanceError) {
      console.error('Error advancing gameweek:', advanceError);
      return new Response(JSON.stringify({ 
        error: 'Failed to advance to next gameweek',
        details: advanceError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the new current gameweek to confirm advancement
    const { data: newGameweek, error: newGameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('is_current', true)
      .single();

    const message = `Successfully advanced from gameweek ${currentGameweek.number} to gameweek ${newGameweek?.number || 'unknown'}`;
    console.log(message);

    return new Response(JSON.stringify({ 
      success: true,
      message,
      previousGameweek: currentGameweek.number,
      currentGameweek: newGameweek?.number,
      automated: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Unexpected error in auto-advance-gameweek:', error);
    return new Response(JSON.stringify({ 
      error: 'Unexpected error occurred',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
