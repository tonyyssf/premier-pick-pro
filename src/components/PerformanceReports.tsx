
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { Download, Activity, Target, TrendingUp, Percent, Clock } from 'lucide-react';

interface PerformanceData {
  overallAccuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracyTrend: Array<{ gameweek: string; accuracy: number }>;
  teamPerformance: Array<{ team: string; picks: number; accuracy: number }>;
  gameweekCompletion: Array<{ gameweek: string; completion: number }>;
  systemHealth: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

const chartConfig = {
  accuracy: {
    label: "Accuracy %",
    color: "hsl(var(--chart-1))",
  },
  picks: {
    label: "Picks",
    color: "hsl(var(--chart-2))",
  },
  completion: {
    label: "Completion %",
    color: "hsl(var(--chart-3))",
  },
};

export const PerformanceReports: React.FC = () => {
  const { data: performance, isLoading } = useQuery({
    queryKey: ['performance-reports'],
    queryFn: async (): Promise<PerformanceData> => {
      // Get gameweek scores for accuracy calculations
      const { data: scores, error: scoresError } = await supabase
        .from('gameweek_scores')
        .select('gameweek_id, is_correct, points');
      
      if (scoresError) throw scoresError;

      // Get gameweeks
      const { data: gameweeks, error: gameweeksError } = await supabase
        .from('gameweeks')
        .select('id, number')
        .order('number');
      
      if (gameweeksError) throw gameweeksError;

      // Get user picks with team info
      const { data: picks, error: picksError } = await supabase
        .from('user_picks')
        .select(`
          gameweek_id,
          picked_team_id,
          teams:picked_team_id (name, short_name)
        `);
      
      if (picksError) throw picksError;

      // Get fixtures to check completion rates
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select('gameweek_id, status');
      
      if (fixturesError) throw fixturesError;

      const totalPredictions = scores.length;
      const correctPredictions = scores.filter(s => s.is_correct).length;
      const overallAccuracy = totalPredictions > 0 
        ? Math.round((correctPredictions / totalPredictions) * 100) 
        : 0;

      // Calculate accuracy trend by gameweek
      const accuracyTrend = gameweeks.map(gw => {
        const gwScores = scores.filter(s => s.gameweek_id === gw.id);
        const gwCorrect = gwScores.filter(s => s.is_correct).length;
        const accuracy = gwScores.length > 0 ? Math.round((gwCorrect / gwScores.length) * 100) : 0;
        
        return {
          gameweek: `GW${gw.number}`,
          accuracy,
        };
      }).slice(-10); // Last 10 gameweeks

      // Calculate team performance
      const teamStats = picks.reduce((acc, pick) => {
        const teamName = pick.teams?.short_name || 'Unknown';
        if (!acc[teamName]) {
          acc[teamName] = { picks: 0, correct: 0 };
        }
        acc[teamName].picks++;
        
        // Find if this pick was correct
        const score = scores.find(s => 
          s.gameweek_id === pick.gameweek_id && 
          picks.some(p => p.gameweek_id === s.gameweek_id && p.picked_team_id === pick.picked_team_id)
        );
        if (score?.is_correct) {
          acc[teamName].correct++;
        }
        
        return acc;
      }, {} as Record<string, { picks: number; correct: number }>);

      const teamPerformance = Object.entries(teamStats)
        .map(([team, stats]) => ({
          team,
          picks: stats.picks,
          accuracy: stats.picks > 0 ? Math.round((stats.correct / stats.picks) * 100) : 0,
        }))
        .sort((a, b) => b.picks - a.picks)
        .slice(0, 10);

      // Calculate gameweek completion rates
      const gameweekCompletion = gameweeks.map(gw => {
        const gwFixtures = fixtures.filter(f => f.gameweek_id === gw.id);
        const completedFixtures = gwFixtures.filter(f => f.status === 'finished');
        const completion = gwFixtures.length > 0 
          ? Math.round((completedFixtures.length / gwFixtures.length) * 100) 
          : 0;
        
        return {
          gameweek: `GW${gw.number}`,
          completion,
        };
      }).slice(-10);

      // Mock system health data (in real app, this would come from monitoring service)
      const systemHealth = {
        uptime: 99.5,
        avgResponseTime: 250,
        errorRate: 0.1,
      };

      return {
        overallAccuracy,
        totalPredictions,
        correctPredictions,
        accuracyTrend,
        teamPerformance,
        gameweekCompletion,
        systemHealth,
      };
    },
    refetchInterval: 30000,
  });

  const downloadReport = () => {
    // In a real implementation, this would generate and download a PDF report
    console.log('Downloading performance report...');
  };

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

  if (!performance) return null;

  return (
    <div className="space-y-6">
      {/* Header with Download */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Reports</h2>
          <p className="text-gray-600">System performance and prediction accuracy metrics</p>
        </div>
        <Button onClick={downloadReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.overallAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              {performance.correctPredictions} of {performance.totalPredictions} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.systemHealth.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.systemHealth.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              API response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.systemHealth.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              System errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart data={performance.accuracyTrend}>
                <XAxis dataKey="gameweek" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="var(--color-accuracy)" 
                  fill="var(--color-accuracy)" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gameweek Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={performance.gameweekCompletion}>
                <XAxis dataKey="gameweek" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completion" fill="var(--color-completion)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Most Picked Teams & Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.teamPerformance.map((team, index) => (
              <div 
                key={team.team} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{team.team}</span>
                </div>
                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <div className="font-bold">{team.picks}</div>
                    <div className="text-xs text-gray-500">picks</div>
                  </div>
                  <div>
                    <Badge 
                      variant={team.accuracy >= 50 ? "default" : "secondary"}
                      className={team.accuracy >= 50 ? "bg-green-100 text-green-800" : ""}
                    >
                      {team.accuracy}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
