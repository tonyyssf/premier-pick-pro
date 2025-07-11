
import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';

interface PickConfirmationHeaderProps {
  gameweekNumber: number;
}

export const PickConfirmationHeader: React.FC<PickConfirmationHeaderProps> = ({
  gameweekNumber
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-green-100 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Pick Confirmed!</h3>
          <p className="text-gray-600">Your pick for Gameweek {gameweekNumber} is locked in</p>
        </div>
      </div>
      
      {/* Trust signals */}
      <div className="flex items-center space-x-2 text-green-600">
        <Shield className="h-5 w-5" />
        <span className="text-sm font-medium">Secured</span>
      </div>
    </div>
  );
};
