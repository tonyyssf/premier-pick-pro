
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured')
    }

    console.log('Fetching Premier League standings...')

    // Fetch current Premier League standings from API
    const response = await fetch('https://api-football-v1.p.rapidapi.com/v3/standings?league=39&season=2024', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('API Response received')

    if (!data.response || !data.response[0] || !data.response[0].league || !data.response[0].league.standings) {
      throw new Error('Invalid API response structure')
    }

    const standingsData = data.response[0].league.standings[0]

    const standings = standingsData.map((team: any) => ({
      id: team.team.id.toString(),
      name: team.team.name,
      shortName: team.team.name.length > 15 ? team.team.name.substring(0, 12) + '...' : team.team.name,
      position: team.rank,
      played: team.all.played,
      won: team.all.win,
      drawn: team.all.draw,
      lost: team.all.lose,
      points: team.points,
      goalsFor: team.all.goals.for,
      goalsAgainst: team.all.goals.against,
      goalDifference: team.goalsDiff
    }))

    console.log(`Processed ${standings.length} teams`)

    return new Response(
      JSON.stringify({
        standings: standings,
        lastUpdated: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error fetching standings:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Premier League standings',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
