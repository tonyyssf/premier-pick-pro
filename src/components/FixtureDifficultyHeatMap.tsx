import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProcessedFixtureDifficulty } from '@/hooks/useFixtureDifficulty';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface FixtureDifficultyHeatMapProps {
  data: ProcessedFixtureDifficulty[];
  currentGameweek: number;
}

export function FixtureDifficultyHeatMap({ data, currentGameweek }: FixtureDifficultyHeatMapProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-500';
    if (difficulty <= 3) return 'bg-yellow-500';
    if (difficulty <= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyIcon = (difficulty: number) => {
    if (difficulty <= 2) return <CheckCircle className="h-3 w-3" />;
    if (difficulty <= 3) return <Shield className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    if (difficulty <= 4) return 'Hard';
    return 'Very Hard';
  };

  // Sort teams by current difficulty (easiest first)
  const sortedData = [...data].sort((a, b) => a.currentDifficulty - b.currentDifficulty);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Fixture Difficulty Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current gameweek difficulty and upcoming fixtures for all teams
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.map((team) => (
            <div
              key={team.team}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{team.team}</h3>
                <Badge
                  variant="outline"
                  className={`${getDifficultyColor(team.currentDifficulty)} text-white border-none`}
                >
                  <div className="flex items-center gap-1">
                    {getDifficultyIcon(team.currentDifficulty)}
                    {team.currentDifficulty}
                  </div>
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current GW:</span>
                  <span className="font-medium">
                    {getDifficultyLabel(team.currentDifficulty)}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg Remaining:</span>
                  <span className="font-medium">{team.averageDifficulty}</span>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">Next 5 fixtures:</div>
                  <div className="flex gap-1">
                    {team.nextFiveGames.map((difficulty, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${getDifficultyColor(difficulty)}`}
                        title={`GW${currentGameweek + index}: ${getDifficultyLabel(difficulty)}`}
                      >
                        {difficulty}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Difficulty Scale</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>1-2: Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>3: Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>4: Hard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>5: Very Hard</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}