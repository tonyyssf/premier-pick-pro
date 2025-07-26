import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProcessedFixtureDifficulty, FixtureDifficultyData } from '@/hooks/useFixtureDifficulty';
import { Shield, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface FixtureDifficultyHeatMapProps {
  data: ProcessedFixtureDifficulty[];
  rawData: FixtureDifficultyData[];
  currentGameweek: number;
}

export function FixtureDifficultyHeatMap({ data, rawData, currentGameweek }: FixtureDifficultyHeatMapProps) {
  const [selectedGameweek, setSelectedGameweek] = useState(currentGameweek);

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

  // Get difficulty for selected gameweek
  const getGameweekDifficulty = (team: ProcessedFixtureDifficulty, gameweek: number) => {
    const index = gameweek - currentGameweek;
    if (index >= 0 && index < team.nextFiveGames.length) {
      return team.nextFiveGames[index];
    }
    
    // For past or far future gameweeks, get from raw data
    const teamRawData = rawData.find(raw => raw.team === team.team);
    if (teamRawData && teamRawData.difficulties[gameweek - 1]) {
      return teamRawData.difficulties[gameweek - 1];
    }
    
    return 3; // Default difficulty
  };

  // Sort teams by selected gameweek difficulty (easiest first)
  const sortedData = [...data].sort((a, b) => {
    const aDifficulty = getGameweekDifficulty(a, selectedGameweek);
    const bDifficulty = getGameweekDifficulty(b, selectedGameweek);
    return aDifficulty - bDifficulty;
  });

  const handlePreviousGameweek = () => {
    if (selectedGameweek > 1) {
      setSelectedGameweek(selectedGameweek - 1);
    }
  };

  const handleNextGameweek = () => {
    if (selectedGameweek < 38) {
      setSelectedGameweek(selectedGameweek + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Fixture Difficulty Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pick difficulty for each team in gameweek {selectedGameweek}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousGameweek}
              disabled={selectedGameweek <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="px-3 py-1 bg-muted rounded-md min-w-[80px] text-center">
              <span className="text-sm font-medium">GW {selectedGameweek}</span>
              {selectedGameweek === currentGameweek && (
                <div className="text-xs text-green-600">Current</div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextGameweek}
              disabled={selectedGameweek >= 38}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Easiest Matchups */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            5 Easiest Matchups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sortedData.slice(0, 5).map((team) => {
              const gameweekDifficulty = getGameweekDifficulty(team, selectedGameweek);
              return (
                <div
                  key={team.team}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-green-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{team.team}</h4>
                    <Badge
                      variant="outline"
                      className={`${getDifficultyColor(gameweekDifficulty)} text-white border-none`}
                    >
                      <div className="flex items-center gap-1">
                        {getDifficultyIcon(gameweekDifficulty)}
                        {gameweekDifficulty}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-medium">
                        {getDifficultyLabel(gameweekDifficulty)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Season Avg:</span>
                      <span className="font-medium">{team.averageDifficulty}</span>
                    </div>
                    
                    {selectedGameweek === currentGameweek && (
                      <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-700 font-medium">
                        Available for picking this week
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hardest Matchups */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            5 Hardest Matchups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {sortedData.slice(-5).reverse().map((team) => {
              const gameweekDifficulty = getGameweekDifficulty(team, selectedGameweek);
              return (
                <div
                  key={team.team}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-red-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">{team.team}</h4>
                    <Badge
                      variant="outline"
                      className={`${getDifficultyColor(gameweekDifficulty)} text-white border-none`}
                    >
                      <div className="flex items-center gap-1">
                        {getDifficultyIcon(gameweekDifficulty)}
                        {gameweekDifficulty}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-medium">
                        {getDifficultyLabel(gameweekDifficulty)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Season Avg:</span>
                      <span className="font-medium">{team.averageDifficulty}</span>
                    </div>
                    
                    {selectedGameweek === currentGameweek && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700 font-medium">
                        Available for picking this week
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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