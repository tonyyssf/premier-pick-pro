
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
      console.error('RAPIDAPI_KEY environment variable is not set')
      throw new Error('RAPIDAPI_KEY not configured')
    }

    console.log('Fetching Premier League standings...')
    console.log('Using RapidAPI Key:', rapidApiKey.substring(0, 10) + '...')

    // For now, return mock data since the API is having issues
    // This will allow the component to work while we resolve the API issues
    const mockStandings = [
      {
        id: '1',
        name: 'Arsenal',
        shortName: 'ARS',
        position: 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '2',
        name: 'Aston Villa',
        shortName: 'AVL',
        position: 2,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '3',
        name: 'AFC Bournemouth',
        shortName: 'BOU',
        position: 3,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '4',
        name: 'Brentford',
        shortName: 'BRE',
        position: 4,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '5',
        name: 'Brighton & Hove Albion',
        shortName: 'BHA',
        position: 5,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '6',
        name: 'Burnley',
        shortName: 'BUR',
        position: 6,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '7',
        name: 'Chelsea',
        shortName: 'CHE',
        position: 7,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '8',
        name: 'Crystal Palace',
        shortName: 'CRY',
        position: 8,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '9',
        name: 'Everton',
        shortName: 'EVE',
        position: 9,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '10',
        name: 'Fulham',
        shortName: 'FUL',
        position: 10,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '11',
        name: 'Liverpool',
        shortName: 'LIV',
        position: 11,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '12',
        name: 'Luton Town',
        shortName: 'LUT',
        position: 12,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '13',
        name: 'Manchester City',
        shortName: 'MCI',
        position: 13,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '14',
        name: 'Manchester United',
        shortName: 'MUN',
        position: 14,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '15',
        name: 'Newcastle United',
        shortName: 'NEW',
        position: 15,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '16',
        name: 'Nottingham Forest',
        shortName: 'NFO',
        position: 16,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '17',
        name: 'Sheffield United',
        shortName: 'SHU',
        position: 17,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '18',
        name: 'Tottenham Hotspur',
        shortName: 'TOT',
        position: 18,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '19',
        name: 'West Ham United',
        shortName: 'WHU',
        position: 19,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      },
      {
        id: '20',
        name: 'Wolverhampton Wanderers',
        shortName: 'WOL',
        position: 20,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      }
    ]

    console.log('Returning mock standings data with all 20 Premier League teams')

    return new Response(
      JSON.stringify({
        standings: mockStandings,
        lastUpdated: new Date().toISOString(),
        note: 'Mock data - API temporarily unavailable due to rate limiting'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in epl-standings function:', error)
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
