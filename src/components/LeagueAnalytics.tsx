
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, Trophy, Globe, Lock, TrendingUp, Calendar } from 'lucide-react';

interface LeagueStats {
  totalLeagues: number;
  publicLeagues: number;
  privateLeagues: number;
  totalMembers: number;
  averageMembersPerLeague: number;
  leaguesBySize: Array<{ size: string; count: number }>;
  leagueCreationTrend: Array<{ date: string; count: number }>;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
  members: {
    label: "Members",
    color: "hsl(var(--chart-2))",
  },
};

export const LeagueAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['league-analytics'],
    queryFn: async (): Promise<LeagueStats> => {
      // Get basic league stats
      const { data: leagues, error: leaguesError } = await supabase
        .from('leagues')
        .select('id, is_public, created_at, max_members');
      
      if (leaguesError) throw leaguesError;

      // Get league member counts
      const { data: memberCounts, error: membersError } = await supabase
        .from('league_members')
        .select('league_id');
      
      if (membersError) throw membersError;

      const memberCountsByLeague = memberCounts.reduce((acc, member) => {
        acc[member.league_id] = (acc[member.league_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalLeagues = leagues.length;
      const publicLeagues = leagues.filter(l => l.is_public).length;
      const privateLeagues = totalLeagues - publicLeagues;
      const totalMembers = memberCounts.length;
      const averageMembersPerLeague = totalLeagues > 0 ? Math.round(totalMembers / totalLeagues * 10) / 10 : 0;

      // Calculate leagues by size
      const leaguesBySize = [
        { size: '1-5 members', count: 0 },
        { size: '6-15 members', count: 0 },
        { size: '16-30 members', count: 0 },
        { size: '31+ members', count: 0 },
      ];

      Object.values(memberCountsByLeague).forEach(count => {
        if (count <= 5) leaguesBySize[0].count++;
        else if (count <= 15) leaguesBySize[1].count++;
        else if (count <= 30) leaguesBySize[2].count++;
        else leaguesBySize[3].count++;
      });

      // Calculate creation trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const leagueCreationTrend = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: leagues.filter(l => l.created_at.startsWith(date)).length,
      }));

      return {
        totalLeagues,
        publicLeagues,
        privateLeagues,
        totalMembers,
        averageMembersPerLeague,
        leaguesBySize,
        leagueCreationTrend,
      };
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const pieData = [
    { name: 'Public', value: stats.publicLeagues, color: '#10b981' },
    { name: 'Private', value: stats.privateLeagues, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
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
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all leagues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Members/League</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMembersPerLeague}</div>
            <p className="text-xs text-muted-foreground">
              Per league
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>League Creation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={stats.leagueCreationTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leagues by Size</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={stats.leaguesBySize} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="size" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Public vs Private Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Public vs Private League Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
