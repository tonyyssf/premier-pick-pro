
import React, { useState, useCallback } from 'react';
import { Gameweek } from '@/types/picks';

interface UseGameweekNavigationProps {
  currentGameweek: Gameweek | null;
  loadGameweekByNumber: (number: number) => Promise<boolean>;
}

export const useGameweekNavigation = ({ 
  currentGameweek, 
  loadGameweekByNumber 
}: UseGameweekNavigationProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [viewingGameweek, setViewingGameweek] = useState<Gameweek | null>(currentGameweek);

  const navigateToGameweek = useCallback(async (direction: 'prev' | 'next') => {
    if (!viewingGameweek || isNavigating) return;

    const targetGameweek = direction === 'next' 
      ? viewingGameweek.number + 1 
      : viewingGameweek.number - 1;

    // Basic bounds checking (assuming gameweeks 1-38)
    if (targetGameweek < 1 || targetGameweek > 38) return;

    setIsNavigating(true);
    
    try {
      const success = await loadGameweekByNumber(targetGameweek);
      if (success) {
        // The loadGameweekByNumber will update the viewing gameweek through the parent component
      }
    } catch (error) {
      console.error('Error navigating to gameweek:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [viewingGameweek, isNavigating, loadGameweekByNumber]);

  const canNavigatePrev = viewingGameweek ? viewingGameweek.number > 1 : false;
  const canNavigateNext = viewingGameweek ? viewingGameweek.number < 38 : false;

  // Update viewing gameweek when current gameweek changes
  React.useEffect(() => {
    if (currentGameweek && (!viewingGameweek || currentGameweek.id !== viewingGameweek.id)) {
      setViewingGameweek(currentGameweek);
    }
  }, [currentGameweek, viewingGameweek]);

  return {
    viewingGameweek,
    setViewingGameweek,
    navigateToGameweek,
    canNavigatePrev,
    canNavigateNext,
    isNavigating
  };
};
