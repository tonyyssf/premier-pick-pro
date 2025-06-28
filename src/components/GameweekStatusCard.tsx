
import React from 'react';
import { usePicks } from '../contexts/PicksContext';

export const GameweekStatusCard: React.FC = () => {
  const { currentGameweek } = usePicks();

  if (!currentGameweek) return null;

  const now = new Date();
  const timeUntilDeadline = currentGameweek.deadline.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="mx-4 mt-4 p-4 bg-plpe-gradient rounded-lg text-plpe-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Matchweek {currentGameweek.number}</h2>
          <p className="text-plpe-accent font-medium">
            Deadline: {hoursLeft}h {minutesLeft}m
          </p>
        </div>
      </div>
    </div>
  );
};
