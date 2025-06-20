
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamStanding {
  id: string;
  name: string;
  shortName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export const PremierLeagueStandings: React.FC = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Calling Supabase Edge Function: epl-standings');
      
      const { data, error: functionError } = await supabase.functions.invoke('epl-standings');

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(`Function error: ${functionError.message}`);
      }

      if (!data) {
        throw new Error('No data received from function');
      }

      console.log('Received data from function:', data);
      
      // Sort alphabetically by team name since season hasn't started
      const sortedStandings = data.standings.sort((a: TeamStanding, b: TeamStanding) => 
        a.name.localeCompare(b.name)
      );
      
      setStandings(sortedStandings);
    } catch (error) {
      console.error('Error fetching standings:', error);
      setError('Failed to load Premier League standings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premier League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner message="Loading Premier League standings..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premier League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchStandings}
              className="px-4 py-2 bg-plpe-purple text-white rounded hover:bg-plpe-purple/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Premier League Standings
          <span className="text-sm font-normal text-gray-500">
            (Alphabetical order - Season not started)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center w-16">P</TableHead>
                <TableHead className="text-center w-16">W</TableHead>
                <TableHead className="text-center w-16">D</TableHead>
                <TableHead className="text-center w-16">L</TableHead>
                <TableHead className="text-center w-20">GD</TableHead>
                <TableHead className="text-center w-16">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team, index) => (
                <TableRow key={team.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{team.name}</span>
                      <span className="text-xs text-gray-500">{team.shortName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{team.played}</TableCell>
                  <TableCell className="text-center">{team.won}</TableCell>
                  <TableCell className="text-center">{team.drawn}</TableCell>
                  <TableCell className="text-center">{team.lost}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      team.goalDifference > 0 ? 'text-green-600' : 
                      team.goalDifference < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {team.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {standings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No standings data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
