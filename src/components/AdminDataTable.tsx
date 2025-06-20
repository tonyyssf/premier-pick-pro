
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Calendar, Users, Database } from 'lucide-react';

interface TeamData {
  id: string;
  name: string;
  short_name: string;
  logo_url: string;
}

interface GameweekData {
  id: string;
  number: number;
  start_date: string;
  end_date: string;
  deadline: string;
  is_current: boolean;
}

interface FixtureData {
  id: string;
  home_team: { name: string };
  away_team: { name: string };
  kickoff_time: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

export const AdminDataTable: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<'teams' | 'gameweeks' | 'fixtures'>('teams');

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as TeamData[];
    }
  });

  const { data: gameweeks, isLoading: gameweeksLoading } = useQuery({
    queryKey: ['admin-gameweeks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gameweeks')
        .select('*')
        .order('number');
      
      if (error) throw error;
      return data as GameweekData[];
    }
  });

  const { data: fixtures, isLoading: fixturesLoading } = useQuery({
    queryKey: ['admin-fixtures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(name),
          away_team:teams!fixtures_away_team_id_fkey(name)
        `)
        .order('kickoff_time')
        .limit(50);
      
      if (error) throw error;
      return data as FixtureData[];
    }
  });

  const renderTeamsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Logo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Short Name</TableHead>
          <TableHead>ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams?.map((team) => (
          <TableRow key={team.id}>
            <TableCell>
              {team.logo_url && (
                <img src={team.logo_url} alt={team.name} className="w-8 h-8 object-contain" />
              )}
            </TableCell>
            <TableCell className="font-medium">{team.name}</TableCell>
            <TableCell>{team.short_name}</TableCell>
            <TableCell className="text-xs text-gray-500">{team.id}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderGameweeksTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gameweek</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gameweeks?.map((gameweek) => (
          <TableRow key={gameweek.id}>
            <TableCell className="font-medium">GW {gameweek.number}</TableCell>
            <TableCell>{new Date(gameweek.start_date).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(gameweek.end_date).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(gameweek.deadline).toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={gameweek.is_current ? "default" : "secondary"}>
                {gameweek.is_current ? "Current" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderFixturesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Match</TableHead>
          <TableHead>Kickoff</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fixtures?.map((fixture) => (
          <TableRow key={fixture.id}>
            <TableCell className="font-medium">
              {fixture.home_team.name} vs {fixture.away_team.name}
            </TableCell>
            <TableCell>{new Date(fixture.kickoff_time).toLocaleString()}</TableCell>
            <TableCell>
              {fixture.home_score !== null && fixture.away_score !== null 
                ? `${fixture.home_score} - ${fixture.away_score}`
                : "TBD"
              }
            </TableCell>
            <TableCell>
              <Badge variant={
                fixture.status === 'finished' ? "default" : 
                fixture.status === 'live' ? "destructive" : "secondary"
              }>
                {fixture.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const getTableData = () => {
    switch (selectedTable) {
      case 'teams':
        return { data: teams, loading: teamsLoading, count: teams?.length || 0 };
      case 'gameweeks':
        return { data: gameweeks, loading: gameweeksLoading, count: gameweeks?.length || 0 };
      case 'fixtures':
        return { data: fixtures, loading: fixturesLoading, count: fixtures?.length || 0 };
      default:
        return { data: [], loading: false, count: 0 };
    }
  };

  const { loading, count } = getTableData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Database Overview</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Database Tables</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    variant={selectedTable === 'teams' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTable('teams')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Teams ({teams?.length || 0})
                  </Button>
                  <Button
                    variant={selectedTable === 'gameweeks' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTable('gameweeks')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Gameweeks ({gameweeks?.length || 0})
                  </Button>
                  <Button
                    variant={selectedTable === 'fixtures' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTable('fixtures')}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Fixtures ({fixtures?.length || 0})
                  </Button>
                </div>
                
                <div className="border rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                  ) : (
                    <>
                      {selectedTable === 'teams' && renderTeamsTable()}
                      {selectedTable === 'gameweeks' && renderGameweeksTable()}
                      {selectedTable === 'fixtures' && renderFixturesTable()}
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{teams?.length || 0}</div>
            <div className="text-sm text-gray-600">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{gameweeks?.length || 0}</div>
            <div className="text-sm text-gray-600">Gameweeks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{fixtures?.length || 0}</div>
            <div className="text-sm text-gray-600">Fixtures</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
