
import React from 'react';
import { usePicks } from '../contexts/PicksContext';

export const GameweekStatusCard: React.FC = () => {
  const { currentGameweek } = usePicks();

  if (!currentGameweek) return null;

  const now = new Date();
  const timeUntilDeadline = currentGameweek.deadline.getTime() - now.getTime();
  
  const daysLeft = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

  const formatDeadline = () => {
    if (daysLeft > 0) {
      return `${daysLeft}d ${hoursLeft}h ${minutesLeft}m`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    } else {
      return `${minutesLeft}m`;
    }
  };

  return (
    <div className="mx-4 mt-4 p-4 bg-plpe-gradient rounded-lg text-plpe-white">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Matchweek {currentGameweek.number}</h2>
        <p className="text-plpe-accent font-medium">
          Deadline: {formatDeadline()}
        </p>
      </div>
    </div>
  );
};
