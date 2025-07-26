
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamStanding {
  id: string;
  name: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
  previousPosition?: number;
}

interface PremierLeagueStandingsProps {
  standings: TeamStanding[];
  loading?: boolean;
}

// Memoized table row component
const StandingRow = React.memo<{
  team: TeamStanding;
  index: number;
}>(({ team, index }) => {
  // Memoized position change calculation
  const positionChange = useMemo(() => {
    if (!team.previousPosition) return null;
    const change = team.previousPosition - team.position;
    if (change > 0) return { direction: 'up', value: change };
    if (change < 0) return { direction: 'down', value: Math.abs(change) };
    return { direction: 'same', value: 0 };
  }, [team.previousPosition, team.position]);

  // Memoized position icon
  const positionIcon = useMemo(() => {
    if (team.position === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (team.position === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (team.position === 3) return <Trophy className="w-4 h-4 text-amber-600" />;
    return null;
  }, [team.position]);

  // Memoized position change icon
  const changeIcon = useMemo(() => {
    if (!positionChange) return null;
    switch (positionChange.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'same':
        return <Minus className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  }, [positionChange]);

  // Memoized goal difference
  const goalDifference = useMemo(() => {
    return team.goalsFor - team.goalsAgainst;
  }, [team.goalsFor, team.goalsAgainst]);

  return (
    <TableRow key={team.id} className="hover:bg-gray-50">
      <TableCell className="font-medium text-center">
        <div className="flex items-center justify-center space-x-1">
          {positionIcon}
          <span>{team.position}</span>
          {positionChange && (
            <div className="flex items-center space-x-1">
              {changeIcon}
              {positionChange.value > 0 && (
                <span className="text-xs text-gray-500">
                  {positionChange.value}
                </span>
              )}
            </div>
          )}
        </div>
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
        <span className={goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}>
          {goalDifference > 0 ? '+' : ''}{goalDifference}
        </span>
      </TableCell>
      <TableCell className="text-center font-bold">{team.points}</TableCell>
    </TableRow>
  );
});

StandingRow.displayName = 'StandingRow';

// Memoized loading skeleton
const LoadingSkeleton = React.memo(() => (
  <div className="space-y-2">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-2 animate-pulse">
        <div className="w-8 h-6 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const PremierLeagueStandings: React.FC<PremierLeagueStandingsProps> = React.memo(({
  standings,
  loading = false
}) => {
  // Memoized sorted standings
  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => {
      // First by points (descending)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      
      // Then by goal difference (descending)
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (bGD !== aGD) {
        return bGD - aGD;
      }
      
      // Then by goals scored (descending)
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      
      // Finally by team name (alphabetical)
      return a.name.localeCompare(b.name);
    });
  }, [standings]);

  // Memoized table rows
  const tableRows = useMemo(() => {
    return sortedStandings.map((team, index) => (
      <StandingRow
        key={team.id}
        team={team}
        index={index}
      />
    ));
  }, [sortedStandings]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalTeams = standings.length;
    const totalMatches = standings.reduce((sum, team) => sum + team.played, 0) / 2;
    const totalGoals = standings.reduce((sum, team) => sum + team.goalsFor, 0);
    const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0.00';
    
    return {
      totalTeams,
      totalMatches,
      totalGoals,
      avgGoalsPerMatch,
    };
  }, [standings]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premier League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Premier League Standings</span>
          <div className="text-sm text-gray-500">
            {stats.totalTeams} teams • {stats.totalMatches} matches • {stats.avgGoalsPerMatch} goals/match
          </div>
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
              {tableRows}
            </TableBody>
          </Table>
        </div>
        
        {standings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No standings data available
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PremierLeagueStandings.displayName = 'PremierLeagueStandings';
