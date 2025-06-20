
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  submitPick: (team: Team) => boolean;
  getTeamUsedCount: (teamId: string) => number;
  hasPickForGameweek: (gameweek: number) => boolean;
  getCurrentPick: () => Pick | null;
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export const PicksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [currentGameweek] = useState(15); // Starting at gameweek 15
  const { toast } = useToast();

  const submitPick = (team: Team): boolean => {
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
