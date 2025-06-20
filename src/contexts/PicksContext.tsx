import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Pick {
  id: string;
  gameweekId: string;
  fixtureId: string;
  pickedTeamId: string;
  timestamp: Date;
}

interface Fixture {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
  };
  kickoffTime: Date;
  status: string;
}

interface Gameweek {
  id: string;
  number: number;
  deadline: Date;
  isCurrent: boolean;
}

interface GameweekScore {
  id: string;
  userId: string;
  gameweekId: string;
  points: number;
  isCorrect: boolean;
}

interface UserStanding {
  id: string;
  userId: string;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  currentRank: number | null;
}

interface PicksContextType {
  picks: Pick[];
  fixtures: Fixture[];
  currentGameweek: Gameweek | null;
  gameweekScores: GameweekScore[];
  userStandings: UserStanding[];
  submitPick: (fixtureId: string, teamId: string) => Promise<boolean>;
  getTeamUsedCount: (teamId: string) => number;
  hasPickForGameweek: (gameweekId: string) => boolean;
  getCurrentPick: () => Pick | null;
  calculateScores: (gameweekId?: string) => Promise<void>;
  loading: boolean;
  fixturesLoading: boolean;
  scoresLoading: boolean;
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export const PicksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [currentGameweek, setCurrentGameweek] = useState<Gameweek | null>(null);
  const [gameweekScores, setGameweekScores] = useState<GameweekScore[]>([]);
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [scoresLoading, setScoresLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load current gameweek and fixtures
  useEffect(() => {
    loadCurrentGameweek();
  }, []);

  // Load user's picks when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserPicks();
      loadScoresAndStandings();
    } else {
      setPicks([]);
      setGameweekScores([]);
      setUserStandings([]);
      setLoading(false);
    }
  }, [user]);

  const loadCurrentGameweek = async () => {
    try {
      // Get current gameweek
      const { data: gameweekData, error: gameweekError } = await supabase
        .from('gameweeks')
        .select('*')
        .eq('is_current', true)
        .single();

      if (gameweekError) {
        console.error('Error loading current gameweek:', gameweekError);
        return;
      }

      const gameweek: Gameweek = {
        id: gameweekData.id,
        number: gameweekData.number,
        deadline: new Date(gameweekData.deadline),
        isCurrent: gameweekData.is_current,
      };

      setCurrentGameweek(gameweek);

      // Load fixtures for current gameweek
      const { data: fixturesData, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .eq('gameweek_id', gameweek.id);

      if (fixturesError) {
        console.error('Error loading fixtures:', fixturesError);
        return;
      }

      const formattedFixtures: Fixture[] = fixturesData.map(fixture => ({
        id: fixture.id,
        homeTeam: {
          id: fixture.home_team.id,
          name: fixture.home_team.name,
          shortName: fixture.home_team.short_name,
        },
        awayTeam: {
          id: fixture.away_team.id,
          name: fixture.away_team.name,
          shortName: fixture.away_team.short_name,
        },
        kickoffTime: new Date(fixture.kickoff_time),
        status: fixture.status,
      }));

      setFixtures(formattedFixtures);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFixturesLoading(false);
    }
  };

  const loadUserPicks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_picks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading picks:', error);
        toast({
          title: "Error Loading Picks",
          description: "Could not load your previous picks.",
          variant: "destructive",
        });
      } else {
        const formattedPicks: Pick[] = data.map(pick => ({
          id: pick.id,
          gameweekId: pick.gameweek_id,
          fixtureId: pick.fixture_id,
          pickedTeamId: pick.picked_team_id,
          timestamp: new Date(pick.created_at),
        }));
        setPicks(formattedPicks);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScoresAndStandings = async () => {
    setScoresLoading(true);
    try {
      // Load gameweek scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('gameweek_scores')
        .select('*')
        .order('created_at', { ascending: false });

      if (scoresError) {
        console.error('Error loading scores:', scoresError);
      } else {
        const formattedScores: GameweekScore[] = scoresData.map(score => ({
          id: score.id,
          userId: score.user_id,
          gameweekId: score.gameweek_id,
          points: score.points,
          isCorrect: score.is_correct,
        }));
        setGameweekScores(formattedScores);
      }

      // Load user standings
      const { data: standingsData, error: standingsError } = await supabase
        .from('user_standings')
        .select('*')
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (standingsError) {
        console.error('Error loading standings:', standingsError);
      } else {
        const formattedStandings: UserStanding[] = standingsData.map(standing => ({
          id: standing.id,
          userId: standing.user_id,
          totalPoints: standing.total_points,
          correctPicks: standing.correct_picks,
          totalPicks: standing.total_picks,
          currentRank: standing.current_rank,
        }));
        setUserStandings(formattedStandings);
      }
    } catch (error) {
      console.error('Error loading scores and standings:', error);
    } finally {
      setScoresLoading(false);
    }
  };

  const calculateScores = async (gameweekId?: string) => {
    try {
      setScoresLoading(true);
      
      if (gameweekId) {
        const { error } = await supabase.rpc('calculate_gameweek_scores', {
          gameweek_uuid: gameweekId
        });
        
        if (error) {
          console.error('Error calculating scores:', error);
          toast({
            title: "Error Calculating Scores",
            description: "Could not calculate scores for this gameweek.",
            variant: "destructive",
          });
          return;
        }
      } else {
        const { error } = await supabase.rpc('update_all_scores');
        
        if (error) {
          console.error('Error updating all scores:', error);
          toast({
            title: "Error Updating Scores",
            description: "Could not update all scores.",
            variant: "destructive",
          });
          return;
        }
      }

      // Reload scores and standings after calculation
      await loadScoresAndStandings();
      
      toast({
        title: "Scores Updated",
        description: "All scores have been calculated and updated.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while calculating scores.",
        variant: "destructive",
      });
    } finally {
      setScoresLoading(false);
    }
  };

  const submitPick = async (fixtureId: string, teamId: string): Promise<boolean> => {
    if (!user || !currentGameweek) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make picks.",
        variant: "destructive",
      });
      return false;
    }

    // Check if already has pick for current gameweek
    if (hasPickForGameweek(currentGameweek.id)) {
      toast({
        title: "Pick Already Made",
        description: "You've already made a pick for this gameweek.",
        variant: "destructive",
      });
      return false;
    }

    // Check if team has been used too many times
    if (getTeamUsedCount(teamId) >= 2) {
      const fixture = fixtures.find(f => f.id === fixtureId);
      const team = fixture?.homeTeam.id === teamId ? fixture.homeTeam : fixture?.awayTeam;
      
      toast({
        title: "Team Used Too Many Times",
        description: `You've already used ${team?.name} 2 times this season.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_picks')
        .insert({
          user_id: user.id,
          gameweek_id: currentGameweek.id,
          fixture_id: fixtureId,
          picked_team_id: teamId,
        });

      if (error) {
        console.error('Error submitting pick:', error);
        toast({
          title: "Error Submitting Pick",
          description: "Could not save your pick. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      const newPick: Pick = {
        id: crypto.randomUUID(),
        gameweekId: currentGameweek.id,
        fixtureId,
        pickedTeamId: teamId,
        timestamp: new Date(),
      };

      setPicks(prevPicks => [...prevPicks, newPick]);
      
      const fixture = fixtures.find(f => f.id === fixtureId);
      const team = fixture?.homeTeam.id === teamId ? fixture.homeTeam : fixture?.awayTeam;
      const opponent = fixture?.homeTeam.id === teamId ? fixture.awayTeam : fixture?.homeTeam;
      
      toast({
        title: "Pick Submitted!",
        description: `You've picked ${team?.name} to win their match against ${opponent?.name}.`,
      });

      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getTeamUsedCount = (teamId: string): number => {
    return picks.filter(pick => pick.pickedTeamId === teamId).length;
  };

  const hasPickForGameweek = (gameweekId: string): boolean => {
    return picks.some(pick => pick.gameweekId === gameweekId);
  };

  const getCurrentPick = (): Pick | null => {
    if (!currentGameweek) return null;
    return picks.find(pick => pick.gameweekId === currentGameweek.id) || null;
  };

  return (
    <PicksContext.Provider value={{
      picks,
      fixtures,
      currentGameweek,
      gameweekScores,
      userStandings,
      submitPick,
      getTeamUsedCount,
      hasPickForGameweek,
      getCurrentPick,
      calculateScores,
      loading,
      fixturesLoading,
      scoresLoading,
    }}>
      {children}
    </PicksContext.Provider>
  );
};

export const usePicks = (): PicksContextType => {
  const context = useContext(PicksContext);
  if (!context) {
    throw new Error('usePicks must be used within a PicksProvider');
  }
  return context;
};
