import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFixtureDifficulty } from '@/hooks/useFixtureDifficulty';
import { useFixturesByGameweek } from '@/hooks/useFixturesByGameweek';
import { usePicks } from '@/contexts/PicksContext';
import { ChevronLeft, ChevronRight, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PlanPicksCard = () => {
  const { currentGameweek } = usePicks();
  const currentGwNumber = currentGameweek?.number || 1;
  
  // Navigate through gameweeks in groups of 5 (1-5, 6-10, 11-15, etc.)
  const [currentChunk, setCurrentChunk] = useState(Math.floor((currentGwNumber - 1) / 5));
  
  const startGameweek = Math.max(1, currentChunk * 5 + 1);
  const endGameweek = Math.min(38, startGameweek + 4);
  const gameweeksToShow = endGameweek - startGameweek + 1;
  
  const [selectedPicks, setSelectedPicks] = useState<Record<number, string>>({});
  
  const { data: difficultyData } = useFixtureDifficulty(currentGwNumber);
  const { picks, getTeamUsedCount } = usePicks();
  
  // Fetch fixtures for all gameweeks we're showing
  const gameweekNumbers = Array.from({ length: gameweeksToShow }, (_, i) => startGameweek + i).filter(gw => gw <= 38);
  const fixtureQueries = gameweekNumbers.map(gw => useFixturesByGameweek(gw));
  
  // Get team usage counts
  const getTeamUsage = (teamShortName: string) => {
    const count = getTeamUsedCount(teamShortName);
    const plannedUsage = Object.values(selectedPicks).filter(pick => pick === teamShortName).length;
    return count + plannedUsage;
  };
  
  // Check if a team is already used
  const isTeamUsed = (teamShortName: string) => getTeamUsage(teamShortName) > 0;
  
  // Get difficulty color class
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-green-50 text-green-700 border-green-100';
      case 3: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
  
  // Get opponent info for a team in a specific gameweek
  const getOpponentInfo = (teamShortName: string, gameweekNumber: number) => {
    const fixtureQuery = fixtureQueries.find((_, index) => startGameweek + index === gameweekNumber);
    if (!fixtureQuery?.data) return null;
    
    // Enhanced team name mapping with variations
    const teamNameToShort: Record<string, string> = {
      'Arsenal': 'ARS',
      'Aston Villa': 'AVL',
      'Bournemouth': 'BOU',
      'AFC Bournemouth': 'BOU',
      'Brentford': 'BRE',
      'Brighton': 'BHA',
      'Brighton & Hove Albion': 'BHA',
      'Chelsea': 'CHE',
      'Crystal Palace': 'CRY',
      'Everton': 'EVE',
      'Fulham': 'FUL',
      'Ipswich': 'IPS',
      'Ipswich Town': 'IPS',
      'Leicester': 'LEI',
      'Leicester City': 'LEI',
      'Liverpool': 'LIV',
      'Man City': 'MCI',
      'Manchester City': 'MCI',
      'Man Utd': 'MUN',
      'Manchester United': 'MUN',
      'Newcastle': 'NEW',
      'Newcastle United': 'NEW',
      'Nottm Forest': 'NFO',
      'Nottingham Forest': 'NFO',
      'Nottingham Forest FC': 'NFO',
      'Nott\'m Forest': 'NFO',
      'Southampton': 'SOU',
      'Tottenham': 'TOT',
      'Tottenham Hotspur': 'TOT',
      'Spurs': 'TOT',
      'West Ham': 'WHU',
      'West Ham United': 'WHU',
      'Wolves': 'WOL',
      'Wolverhampton Wanderers': 'WOL',
      // Legacy/relegated teams that might appear in fixture data
      'Burnley': 'BUR',
      'Burnley FC': 'BUR',
      'Leeds': 'LEE',
      'Leeds United': 'LEE',
      'Sheffield United': 'SHU',
      'Luton': 'LUT',
      'Luton Town': 'LUT',
      'Sunderland': 'SUN',
      'Sunderland AFC': 'SUN'
    };
    
    const teamMapping: Record<string, string> = {
      'ARS': 'Arsenal', 'AVL': 'Aston Villa', 'BOU': 'Bournemouth', 'BRE': 'Brentford',
      'BHA': 'Brighton', 'CHE': 'Chelsea', 'CRY': 'Crystal Palace', 'EVE': 'Everton',
      'FUL': 'Fulham', 'IPS': 'Ipswich', 'LEI': 'Leicester', 'LIV': 'Liverpool',
      'MCI': 'Man City', 'MUN': 'Man Utd', 'NEW': 'Newcastle', 'NFO': 'Nottm Forest',
      'SOU': 'Southampton', 'TOT': 'Tottenham', 'WHU': 'West Ham', 'WOL': 'Wolves'
    };
    
    const teamFullName = teamMapping[teamShortName];
    if (!teamFullName) return null;
    
    const fixture = fixtureQuery.data.find(f => 
      f.home_team_name === teamFullName || f.away_team_name === teamFullName
    );
    
    if (!fixture) return null;
    
    const isHome = fixture.home_team_name === teamFullName;
    const opponentName = isHome ? fixture.away_team_name : fixture.home_team_name;
    const opponentShort = teamNameToShort[opponentName] || opponentName.slice(0, 3).toUpperCase();
    
    return {
      opponent: opponentShort,
      isHome,
      status: fixture.status
    };
  };
  
  // Get teams from difficulty data and filter out relegated teams
  const currentSeasonTeams = ['ARS', 'AVL', 'BOU', 'BRE', 'BHA', 'CHE', 'CRY', 'EVE', 'FUL', 'IPS', 'LEI', 'LIV', 'MCI', 'MUN', 'NEW', 'NFO', 'SOU', 'TOT', 'WHU', 'WOL'];
  const teams = (difficultyData?.processedData || []).filter(team => currentSeasonTeams.includes(team.team));
  const rawTeams = (difficultyData?.rawData || []).filter(team => currentSeasonTeams.includes(team.team));
  
  // Get difficulty for a team and gameweek
  const getTeamDifficulty = (teamShortName: string, gameweekNumber: number) => {
    const teamData = rawTeams.find(t => t.team === teamShortName);
    if (!teamData) return 3;
    return teamData.difficulties[gameweekNumber - 1] || 3;
  };
  
  // Handle pick selection
  const handlePickSelect = (teamShortName: string, gameweekNumber: number) => {
    setSelectedPicks(prev => {
      const key = gameweekNumber;
      const newPicks = { ...prev };
      
      if (newPicks[key] === teamShortName) {
        // Deselect if already selected
        delete newPicks[key];
      } else {
        // Select new team for this gameweek
        newPicks[key] = teamShortName;
      }
      
      return newPicks;
    });
  };
  
  // Check if we can navigate to previous/next chunks
  const canNavigatePrev = currentChunk > 0;
  const canNavigateNext = currentChunk < 7; // 38 gameweeks = 8 chunks (0-7)
  
  if (!difficultyData || teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Plan Your Picks
          </CardTitle>
          <CardDescription>
            Plan your picks for upcoming gameweeks based on fixture difficulty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading fixture difficulty data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Plan Your Picks
              </CardTitle>
              <CardDescription>
                Plan your picks for gameweeks {startGameweek}-{endGameweek} based on fixture difficulty
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentChunk(currentChunk - 1)}
                disabled={!canNavigatePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                GW {startGameweek}-{endGameweek}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentChunk(currentChunk + 1)}
                disabled={!canNavigateNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium">Difficulty:</span>
            {[1, 2, 3, 4, 5].map(diff => (
              <Badge
                key={diff}
                variant="outline"
                className={cn("px-2 py-1", getDifficultyColor(diff))}
              >
                {diff}
              </Badge>
            ))}
            <span className="text-muted-foreground ml-4">
              (H) = Home • Used teams are marked
            </span>
          </div>
          
          {/* Planning Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1 font-medium sticky left-0 bg-background">Team</th>
                  {gameweekNumbers.map(gw => (
                    <th key={gw} className="text-center py-2 px-1 font-medium min-w-[80px]">
                      GW{gw}
                    </th>
                  ))}
                  <th className="text-center py-2 px-1 font-medium">Usage</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => {
                  const teamUsage = getTeamUsage(team.team);
                  const isOverused = teamUsage > 1;
                  
                  return (
                    <tr key={team.team} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-1 font-medium sticky left-0 bg-background">
                        <div className="flex items-center gap-2">
                          {team.team}
                          {isOverused && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Team used {teamUsage} times
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      
                       {gameweekNumbers.map(gw => {
                         const difficulty = getTeamDifficulty(team.team, gw);
                         const opponentInfo = getOpponentInfo(team.team, gw);
                        const isSelected = selectedPicks[gw] === team.team;
                        const isUsed = isTeamUsed(team.team) && !isSelected;
                        
                        return (
                          <td key={gw} className="py-1 px-1 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "h-12 w-full flex flex-col items-center gap-1 relative",
                                    getDifficultyColor(difficulty),
                                    isSelected && "ring-2 ring-primary",
                                    isUsed && "opacity-50"
                                  )}
                                  onClick={() => handlePickSelect(team.team, gw)}
                                  disabled={isUsed}
                                >
                                  {isSelected && (
                                    <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-primary" />
                                  )}
                                  
                                  <span className="font-medium">{difficulty}</span>
                                  
                                  {opponentInfo && (
                                    <span className="text-xs">
                                      {opponentInfo.isHome ? '(H)' : ''} {opponentInfo.opponent}
                                    </span>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <div className="font-medium">{team.team} vs {opponentInfo?.opponent || 'TBD'}</div>
                                  <div>Difficulty: {difficulty}/5</div>
                                  <div>{opponentInfo?.isHome ? 'Home' : 'Away'} fixture</div>
                                  {isUsed && <div className="text-orange-500">Team already used</div>}
                                  {isSelected && <div className="text-green-500">Selected for GW{gw}</div>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                      
                      <td className="py-2 px-1 text-center">
                        <Badge 
                          variant={isOverused ? "destructive" : teamUsage > 0 ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {teamUsage}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          {Object.keys(selectedPicks).length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Planned Picks:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedPicks).map(([gw, team]) => (
                  <Badge key={gw} variant="default" className="text-xs">
                    GW{gw}: {team}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};