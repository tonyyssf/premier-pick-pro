
import React from 'react';
import { Clock, Shield } from 'lucide-react';

export const PickConfirmationLocked: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Pick locked - match started</span>
        </div>
      </div>

      {/* Locked state warning */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-gray-600" />
          <div className="text-sm text-gray-700">
            <p className="font-medium">Pick is locked</p>
            <p className="text-xs mt-1">
              You can no longer change your pick as the gameweek has started. 
              Good luck with your selection!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
