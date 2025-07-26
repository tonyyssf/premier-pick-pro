import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProcessedFixtureDifficulty } from '@/hooks/useFixtureDifficulty';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FixtureRunAnalysisProps {
  data: ProcessedFixtureDifficulty[];
  currentGameweek: number;
}

export function FixtureRunAnalysis({ data, currentGameweek }: FixtureRunAnalysisProps) {
  // Analyze teams for best/worst runs
  const getFixtureRun = (team: ProcessedFixtureDifficulty, gameweekStart: number, gameweekCount: number) => {
    const startIndex = gameweekStart - 1;
    const fixtures = team.nextFiveGames.slice(0, Math.min(gameweekCount, team.nextFiveGames.length));
    const avgDifficulty = fixtures.length > 0 
      ? fixtures.reduce((sum, diff) => sum + diff, 0) / fixtures.length 
      : 0;
    
    return {
      team: team.team,
      fixtures,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      fixtureCount: fixtures.length
    };
  };

  // Get best and worst fixture runs for next 3 and 5 gameweeks
  const nextThreeRuns = data.map(team => getFixtureRun(team, currentGameweek, 3));
  const nextFiveRuns = data.map(team => getFixtureRun(team, currentGameweek, 5));

  const bestThreeRuns = nextThreeRuns
    .filter(run => run.fixtureCount >= 3)
    .sort((a, b) => a.avgDifficulty - b.avgDifficulty)
    .slice(0, 5);

  const worstThreeRuns = nextThreeRuns
    .filter(run => run.fixtureCount >= 3)
    .sort((a, b) => b.avgDifficulty - a.avgDifficulty)
    .slice(0, 5);

  const bestFiveRuns = nextFiveRuns
    .filter(run => run.fixtureCount >= 5)
    .sort((a, b) => a.avgDifficulty - b.avgDifficulty)
    .slice(0, 5);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-50';
    if (difficulty <= 3) return 'text-yellow-600 bg-yellow-50';
    if (difficulty <= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = (difficulty: number) => {
    if (difficulty <= 2.5) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (difficulty <= 3.5) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingUp className="h-4 w-4 text-red-600" />;
  };

  const renderFixtureRun = (run: any) => (
    <div key={run.team} className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {getTrendIcon(run.avgDifficulty)}
        <span className="font-medium">{run.team}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {run.fixtures.map((difficulty: number, index: number) => (
            <div
              key={index}
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-muted"
            >
              {difficulty}
            </div>
          ))}
        </div>
        <Badge className={getDifficultyColor(run.avgDifficulty)}>
          {run.avgDifficulty}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Best 3-Game Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingDown className="h-5 w-5" />
            Best 3-Game Runs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Teams with the easiest upcoming 3 fixtures
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bestThreeRuns.map(renderFixtureRun)}
          </div>
        </CardContent>
      </Card>

      {/* Worst 3-Game Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            Worst 3-Game Runs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Teams with the hardest upcoming 3 fixtures
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {worstThreeRuns.map(renderFixtureRun)}
          </div>
        </CardContent>
      </Card>

      {/* Best 5-Game Runs */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <TrendingDown className="h-5 w-5" />
            Best 5-Game Runs
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Teams with the easiest upcoming 5 fixtures - ideal for long-term planning
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bestFiveRuns.map(renderFixtureRun)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}