
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { Button } from './ui/button';

export const GameweekStatusCard: React.FC = () => {
  const { currentGameweek, hasPickForGameweek } = usePicks();

  if (!currentGameweek) return null;

  const hasPickForCurrentGameweek = hasPickForGameweek(currentGameweek.id);
  const now = new Date();
  const timeUntilDeadline = currentGameweek.deadline.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="mx-4 mt-4 p-4 bg-purple-900 rounded-lg text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gameweek {currentGameweek.number}</h2>
          <p className="text-green-400 font-medium">
            Deadline: {hoursLeft}h {minutesLeft}m
          </p>
        </div>
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
          onClick={() => {
            // Scroll to weekly picks section
            const picksSection = document.querySelector('[data-section="weekly-picks"]');
            if (picksSection) {
              picksSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {hasPickForCurrentGameweek ? 'View Pick' : 'Make Pick'}
        </Button>
      </div>
    </div>
  );
};
