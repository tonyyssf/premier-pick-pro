
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Globe } from 'lucide-react';
import type { LeagueStats } from '@/types/analytics';

interface LeagueMetricCardsProps {
  stats: LeagueStats;
}

export const LeagueMetricCards: React.FC<LeagueMetricCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeagues}</div>
          <p className="text-xs text-muted-foreground">
            {stats.publicLeagues} public, {stats.privateLeagues} private
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          <p className="text-xs text-muted-foreground">
            Across all leagues
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Memberships</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <p className="text-xs text-muted-foreground">
            Including multi-league users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Public vs Private</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {Math.round((stats.publicLeagues / stats.totalLeagues) * 100)}% Public
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
