
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Pick {
  gameweek: number;
  teamId: string;
  teamName: string;
  opponent: string;
  venue: 'H' | 'A';
  timestamp: Date;
}

interface Team {
  id: string;
  name: string;
  opponent: string;
  venue: 'H' | 'A';
  usedCount: number;
}

interface PicksContextType {
  picks: Pick[];
  currentGameweek: number;
  submitPick: (team: Team) => Promise<boolean>;
  getTeamUsedCount: (teamId: string) => number;
  hasPickForGameweek: (gameweek: number) => boolean;
  getCurrentPick: () => Pick | null;
  loading: boolean;
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export const PicksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [currentGameweek] = useState(15);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user's picks from Supabase when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserPicks();
    } else {
      setPicks([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserPicks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_picks')
        .select('*')
        .eq('user_id', user.id)
        .order('gameweek', { ascending: true });

      if (error) {
        console.error('Error loading picks:', error);
        toast({
          title: "Error Loading Picks",
          description: "Could not load your previous picks.",
          variant: "destructive",
        });
      } else {
        const formattedPicks = data.map(pick => ({
          gameweek: pick.gameweek,
          teamId: pick.team_id,
          teamName: pick.team_name,
          opponent: pick.opponent,
          venue: pick.venue as 'H' | 'A',
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

  const submitPick = async (team: Team): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make picks.",
        variant: "destructive",
      });
      return false;
    }

    // Check if already has pick for current gameweek
    if (hasPickForGameweek(currentGameweek)) {
      toast({
        title: "Pick Already Made",
        description: "You've already made a pick for this gameweek.",
        variant: "destructive",
      });
      return false;
    }

    // Check if team has been used too many times
    if (getTeamUsedCount(team.id) >= 2) {
      toast({
        title: "Team Used Too Many Times",
        description: `You've already used ${team.name} 2 times this season.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_picks')
        .insert({
          user_id: user.id,
          gameweek: currentGameweek,
          team_id: team.id,
          team_name: team.name,
          opponent: team.opponent,
          venue: team.venue,
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
        gameweek: currentGameweek,
        teamId: team.id,
        teamName: team.name,
        opponent: team.opponent,
        venue: team.venue,
        timestamp: new Date(),
      };

      setPicks(prevPicks => [...prevPicks, newPick]);
      
      toast({
        title: "Pick Submitted!",
        description: `You've picked ${team.name} to win their match against ${team.opponent}.`,
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
    return picks.filter(pick => pick.teamId === teamId).length;
  };

  const hasPickForGameweek = (gameweek: number): boolean => {
    return picks.some(pick => pick.gameweek === gameweek);
  };

  const getCurrentPick = (): Pick | null => {
    return picks.find(pick => pick.gameweek === currentGameweek) || null;
  };

  return (
    <PicksContext.Provider value={{
      picks,
      currentGameweek,
      submitPick,
      getTeamUsedCount,
      hasPickForGameweek,
      getCurrentPick,
      loading,
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
