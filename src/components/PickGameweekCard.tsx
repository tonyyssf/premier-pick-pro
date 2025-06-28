
import React from 'react';
import { usePicks } from '../contexts/PicksContext';

export const PickGameweekCard: React.FC = () => {
  const { currentGameweek, hasPickForGameweek } = usePicks();

  if (!currentGameweek) return null;

  const hasPickForCurrentGameweek = hasPickForGameweek(currentGameweek.id);
  const now = new Date();
  const timeUntilDeadline = currentGameweek.deadline.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="mx-4 mt-4 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Gameweek {currentGameweek.number}</h2>
          <p className="text-green-400 font-medium">
            Deadline: {hoursLeft}h {minutesLeft}m
          </p>
        </div>
        {!hasPickForCurrentGameweek && (
          <div className="bg-red-500 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">Pick Required</span>
          </div>
        )}
      </div>
    </div>
  );
};
