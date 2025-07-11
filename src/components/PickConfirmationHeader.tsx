
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface PickConfirmationHeaderProps {
  gameweekNumber: number;
}

export const PickConfirmationHeader: React.FC<PickConfirmationHeaderProps> = ({
  gameweekNumber
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="p-2 bg-green-100 rounded-full">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">Pick Confirmed!</h3>
        <p className="text-sm text-gray-600">Gameweek {gameweekNumber}</p>
      </div>
    </div>
  );
};
