
import React from 'react';
import { GameweekHeader } from './GameweekHeader';
import { DeadlineCard } from './DeadlineCard';
import { Gameweek } from '@/types/picks';

interface WeeklyPicksHeaderProps {
  currentGameweek: Gameweek;
  hasAlreadyPicked: boolean;
}

export const WeeklyPicksHeader: React.FC<WeeklyPicksHeaderProps> = ({
  currentGameweek,
  hasAlreadyPicked
}) => {
  return (
    <>
      <GameweekHeader 
        gameweek={currentGameweek} 
        title={hasAlreadyPicked ? "Your Pick" : "Make Your Pick"} 
      />

      <DeadlineCard 
        deadline={currentGameweek.deadline} 
        gameweekNumber={currentGameweek.number} 
      />
    </>
  );
};
