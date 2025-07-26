import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Calendar, Users, Database, User } from 'lucide-react';

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

interface ProfileData {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  created_at: string;
}

// Memoized table row components
const ProfileTableRow = React.memo<{ profile: ProfileData }>(({ profile }) => (
  <TableRow key={profile.id}>
    <TableCell className="font-medium">{profile.name || 'N/A'}</TableCell>
    <TableCell>{profile.username || 'N/A'}</TableCell>
    <TableCell>{profile.email || 'N/A'}</TableCell>
    <TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell>
    <TableCell className="text-xs text-gray-500">{profile.id}</TableCell>
  </TableRow>
));

const TeamTableRow = React.memo<{ team: TeamData }>(({ team }) => (
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
));

const GameweekTableRow = React.memo<{ gameweek: GameweekData }>(({ gameweek }) => (
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
));

const FixtureTableRow = React.memo<{ fixture: FixtureData }>(({ fixture }) => (
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
));

// Memoized table components
const ProfilesTable = React.memo<{ profiles: ProfileData[] | undefined }>(({ profiles }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Username</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>ID</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {profiles?.map((profile) => (
        <ProfileTableRow key={profile.id} profile={profile} />
      ))}
    </TableBody>
  </Table>
));

const TeamsTable = React.memo<{ teams: TeamData[] | undefined }>(({ teams }) => (
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
        <TeamTableRow key={team.id} team={team} />
      ))}
    </TableBody>
  </Table>
));

const GameweeksTable = React.memo<{ gameweeks: GameweekData[] | undefined }>(({ gameweeks }) => (
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
        <GameweekTableRow key={gameweek.id} gameweek={gameweek} />
      ))}
    </TableBody>
  </Table>
));

const FixturesTable = React.memo<{ fixtures: FixtureData[] | undefined }>(({ fixtures }) => (
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
        <FixtureTableRow key={fixture.id} fixture={fixture} />
      ))}
    </TableBody>
  </Table>
));

// Main component with optimizations
export const AdminDataTable: React.FC = React.memo(() => {
  const [selectedTable, setSelectedTable] = useState<'teams' | 'gameweeks' | 'fixtures' | 'profiles'>('profiles');

  // Memoized query functions
  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as TeamData[];
  }, []);

  const fetchGameweeks = useCallback(async () => {
    const { data, error } = await supabase
      .from('gameweeks')
      .select('*')
      .order('number');
    
    if (error) throw error;
    return data as GameweekData[];
  }, []);

  const fetchFixtures = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_fixtures')
      .select('*')
      .order('kickoff_time')
      .limit(50);
    
    if (error) throw error;
    return data.map(fixture => ({
      id: fixture.id,
      home_team: { name: fixture.home_team_name },
      away_team: { name: fixture.away_team_name },
      kickoff_time: fixture.kickoff_time,
      status: fixture.status,
      home_score: fixture.home_score,
      away_score: fixture.away_score,
    })) as FixtureData[];
  }, []);

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ProfileData[];
  }, []);

  // Queries with optimized settings
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: fetchTeams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  const { data: gameweeks, isLoading: gameweeksLoading } = useQuery({
    queryKey: ['admin-gameweeks'],
    queryFn: fetchGameweeks,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: fixtures, isLoading: fixturesLoading } = useQuery({
    queryKey: ['admin-fixtures'],
    queryFn: fetchFixtures,
    staleTime: 2 * 60 * 1000, // 2 minutes for fixtures
    gcTime: 5 * 60 * 1000,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: fetchProfiles,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Memoized table selection handler
  const handleTableSelect = useCallback((table: 'teams' | 'gameweeks' | 'fixtures' | 'profiles') => {
    setSelectedTable(table);
  }, []);

  // Memoized table data
  const tableData = useMemo(() => {
    switch (selectedTable) {
      case 'profiles':
        return { data: profiles, loading: profilesLoading, count: profiles?.length || 0 };
      case 'teams':
        return { data: teams, loading: teamsLoading, count: teams?.length || 0 };
      case 'gameweeks':
        return { data: gameweeks, loading: gameweeksLoading, count: gameweeks?.length || 0 };
      case 'fixtures':
        return { data: fixtures, loading: fixturesLoading, count: fixtures?.length || 0 };
      default:
        return { data: [], loading: false, count: 0 };
    }
  }, [selectedTable, profiles, teams, gameweeks, fixtures, profilesLoading, teamsLoading, gameweeksLoading, fixturesLoading]);

  // Memoized table buttons
  const tableButtons = useMemo(() => [
    {
      key: 'profiles' as const,
      label: 'Users',
      icon: User,
      count: profiles?.length || 0,
    },
    {
      key: 'teams' as const,
      label: 'Teams',
      icon: Users,
      count: teams?.length || 0,
    },
    {
      key: 'gameweeks' as const,
      label: 'Gameweeks',
      icon: Calendar,
      count: gameweeks?.length || 0,
    },
    {
      key: 'fixtures' as const,
      label: 'Fixtures',
      icon: Database,
      count: fixtures?.length || 0,
    },
  ], [profiles?.length, teams?.length, gameweeks?.length, fixtures?.length]);

  // Memoized table renderer
  const renderSelectedTable = useMemo(() => {
    switch (selectedTable) {
      case 'profiles':
        return <ProfilesTable profiles={profiles} />;
      case 'teams':
        return <TeamsTable teams={teams} />;
      case 'gameweeks':
        return <GameweeksTable gameweeks={gameweeks} />;
      case 'fixtures':
        return <FixturesTable fixtures={fixtures} />;
      default:
        return null;
    }
  }, [selectedTable, profiles, teams, gameweeks, fixtures]);

  const { loading, count } = tableData;

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
                  {tableButtons.map(({ key, label, icon: Icon, count }) => (
                    <Button
                      key={key}
                      variant={selectedTable === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTableSelect(key)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label} ({count})
                    </Button>
                  ))}
                </div>
                
                <div className="border rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                  ) : (
                    renderSelectedTable
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600">
          Total {selectedTable}: {count}
        </div>
      </CardContent>
    </Card>
  );
});

AdminDataTable.displayName = 'AdminDataTable';
