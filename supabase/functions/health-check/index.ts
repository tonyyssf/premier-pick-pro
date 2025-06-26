
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for health checks
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Test database connectivity by querying the user_picks table
    const { data, error } = await supabase
      .from('user_picks')
      .select('id')
      .limit(1);

    const dbStatus = error ? 'error' : 'ok';
    const status = error ? 500 : 200;

    console.log(`Health check - DB Status: ${dbStatus}`, error ? error.message : 'OK');

    return new Response(
      JSON.stringify({
        app: 'ok',
        db: dbStatus,
        timestamp: new Date().toISOString(),
        ...(error && { error: error.message })
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    
    return new Response(
      JSON.stringify({
        app: 'error',
        db: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
})
