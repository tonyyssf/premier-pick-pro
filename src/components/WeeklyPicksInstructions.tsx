
import React from 'react';
import { Card, CardContent } from './ui/card';

export const WeeklyPicksInstructions: React.FC = () => {
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            i
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to make your pick:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Choose one team from any match below</li>
              <li>Click on the team you think will win</li>
              <li>Your pick will be confirmed automatically</li>
              <li>You can change your pick until the first match starts</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
