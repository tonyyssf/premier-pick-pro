
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PicksContextType } from '@/types/picks';
import { useGameweekData } from '@/hooks/useGameweekData';
import { usePicksData } from '@/hooks/usePicksData';
import { useScoresAndStandings } from '@/hooks/useScoresAndStandings';
import { usePickActions } from '@/hooks/usePickActions';
import { useGameweekManagement } from '@/hooks/useGameweekManagement';
import { useGameweekNavigation } from '@/hooks/useGameweekNavigation';

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export const PicksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const {
    currentGameweek,
    viewingGameweek,
    fixtures,
    fixturesLoading,
    loadCurrentGameweek,
    loadGameweekByNumber,
    setViewingGameweek
  } = useGameweekData();

  const {
    picks,
    loading,
    setPicks,
    loadUserPicks
  } = usePicksData(user);

  const {
    gameweekScores,
    userStandings,
    scoresLoading,
    setScoresLoading,
    loadScoresAndStandings
  } = useScoresAndStandings(user);

  const navigation = useGameweekNavigation({
    currentGameweek: viewingGameweek,
    loadGameweekByNumber
  });

  // Helper functions that work for both authenticated and guest users
  const getTeamUsedCount = (teamId: string): number => {
    if (!user) return 0; // Guests haven't used any teams
    return picks.filter(pick => pick.pickedTeamId === teamId).length;
  };

  const hasPickForGameweek = (gameweekId: string): boolean => {
    if (!user) return false; // Guests have no picks
    return picks.some(pick => pick.gameweekId === gameweekId);
  };

  const {
    submitPick,
    undoPick,
    canUndoPick,
    getCurrentPick
  } = usePickActions(
    user,
    currentGameweek,
    picks,
    fixtures,
    setPicks,
    getTeamUsedCount,
    hasPickForGameweek
  );

  // Wrap loadCurrentGameweek to match expected Promise<void> signature
  const wrappedLoadCurrentGameweek = async (): Promise<void> => {
    await loadCurrentGameweek();
  };

  const {
    advanceToNextGameweek,
    calculateScores
  } = useGameweekManagement(
    wrappedLoadCurrentGameweek,
    loadUserPicks,
    loadScoresAndStandings,
    setScoresLoading,
    user
  );

  return (
    <PicksContext.Provider value={{
      picks,
      fixtures,
      currentGameweek,
      viewingGameweek,
      gameweekScores,
      userStandings,
      submitPick,
      undoPick,
      canUndoPick,
      getTeamUsedCount,
      hasPickForGameweek,
      getCurrentPick,
      calculateScores,
      advanceToNextGameweek,
      loading,
      fixturesLoading,
      scoresLoading,
      navigation
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
