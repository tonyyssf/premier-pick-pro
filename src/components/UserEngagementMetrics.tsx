
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { Users, UserCheck, Trophy, Target, Calendar, TrendingUp } from 'lucide-react';

interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  usersWithPicks: number;
  averagePicksPerUser: number;
  userRegistrationTrend: Array<{ date: string; count: number }>;
  pickActivityTrend: Array<{ gameweek: string; picks: number }>;
  topPerformers: Array<{ id: string; name: string; points: number; rank: number }>;
}

const chartConfig = {
  count: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  picks: {
    label: "Picks",
    color: "hsl(var(--chart-2))",
  },
};

export const UserEngagementMetrics: React.FC = () => {
  const { data: engagement, isLoading } = useQuery({
    queryKey: ['user-engagement'],
    queryFn: async (): Promise<UserEngagement> => {
      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, created_at');
      
      if (profilesError) throw profilesError;

      // Get user picks
      const { data: picks, error: picksError } = await supabase
        .from('user_picks')
        .select('user_id, gameweek_id, created_at');
      
      if (picksError) throw picksError;

      // Get user standings for top performers - use the unified standings table
      const { data: standings, error: standingsError } = await supabase
        .from('standings')
        .select('user_id, total_points, current_rank')
        .is('league_id', null) // Global standings only (not league-specific)
        .order('total_points', { ascending: false })
        .limit(10);
      
      if (standingsError) throw standingsError;

      // Get gameweeks for trend analysis
      const { data: gameweeks, error: gameweeksError } = await supabase
        .from('gameweeks')
        .select('id, number')
        .order('number');
      
      if (gameweeksError) throw gameweeksError;

      const totalUsers = profiles.length;
      const usersWithPicks = new Set(picks.map(p => p.user_id)).size;
      const activeUsers = usersWithPicks; // Users who have made picks
      const averagePicksPerUser = totalUsers > 0 ? Math.round((picks.length / totalUsers) * 10) / 10 : 0;

      // User registration trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const userRegistrationTrend = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: profiles.filter(p => p.created_at.startsWith(date)).length,
      }));

      // Pick activity trend by gameweek
      const pickActivityTrend = gameweeks.map(gw => ({
        gameweek: `GW${gw.number}`,
        picks: picks.filter(p => p.gameweek_id === gw.id).length,
      })).slice(-10); // Last 10 gameweeks

      // Top performers - manually join with profiles data
      const topPerformers = standings.map(s => {
        const profile = profiles.find(p => p.id === s.user_id);
        return {
          id: s.user_id,
          name: profile?.name || profile?.username || 'Unknown User',
          points: s.total_points,
          rank: s.current_rank || 0,
        };
      }).slice(0, 5);

      return {
        totalUsers,
        activeUsers,
        usersWithPicks,
        averagePicksPerUser,
        userRegistrationTrend,
        pickActivityTrend,
        topPerformers,
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

  if (!engagement) return null;

  const engagementRate = engagement.totalUsers > 0 
    ? Math.round((engagement.activeUsers / engagement.totalUsers) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with picks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Users making picks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Picks/User</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement.averagePicksPerUser}</div>
            <p className="text-xs text-muted-foreground">
              Per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={engagement.userRegistrationTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--color-count)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-count)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pick Activity by Gameweek</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={engagement.pickActivityTrend}>
                <XAxis dataKey="gameweek" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="picks" fill="var(--color-picks)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagement.topPerformers.map((performer, index) => (
              <div 
                key={performer.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{performer.rank}
                  </Badge>
                  <span className="font-medium">{performer.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{performer.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
