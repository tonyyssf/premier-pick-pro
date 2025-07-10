
import React from 'react';
import { GameweekHeader } from './GameweekHeader';
import { DeadlineCard } from './DeadlineCard';
import { Gameweek } from '@/types/picks';

interface WeeklyPicksHeaderProps {
  currentGameweek: Gameweek;
  viewingGameweek: Gameweek;
  hasAlreadyPicked: boolean;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  isNavigating?: boolean;
}

export const WeeklyPicksHeader: React.FC<WeeklyPicksHeaderProps> = ({
  currentGameweek,
  viewingGameweek,
  hasAlreadyPicked,
  onNavigate,
  canNavigatePrev,
  canNavigateNext,
  isNavigating
}) => {
  const isCurrentGameweek = currentGameweek.id === viewingGameweek.id;
  const title = isCurrentGameweek 
    ? (hasAlreadyPicked ? "Your Pick" : "Make Your Pick")
    : `Gameweek ${viewingGameweek.number} ${hasAlreadyPicked ? "Pick" : "Fixtures"}`;

  return (
    <>
      <GameweekHeader 
        gameweek={viewingGameweek} 
        title={title}
        onNavigate={onNavigate}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        isNavigating={isNavigating}
      />

      <DeadlineCard 
        deadline={viewingGameweek.deadline} 
        gameweekNumber={viewingGameweek.number} 
      />
    </>
  );
};
