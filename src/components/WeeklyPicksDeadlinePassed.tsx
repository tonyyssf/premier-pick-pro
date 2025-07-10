
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface WeeklyPicksDeadlinePassedProps {
  gameweekNumber: number;
}

export const WeeklyPicksDeadlinePassed: React.FC<WeeklyPicksDeadlinePassedProps> = ({
  gameweekNumber
}) => {
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Deadline Passed</h3>
        <p className="text-red-800">
          The deadline for Gameweek {gameweekNumber} has passed. 
          You can no longer make picks for this round.
        </p>
      </CardContent>
    </Card>
  );
};
