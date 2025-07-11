
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Pick, Fixture } from '@/types/picks';

interface PickConfirmationDetailsProps {
  currentPick: Pick;
  pickInfo: {
    team: { name: string };
    opponent: { name: string };
    venue: string;
    fixture: Fixture;
  };
}

export const PickConfirmationDetails: React.FC<PickConfirmationDetailsProps> = ({
  currentPick,
  pickInfo
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h4 className="text-lg font-bold text-gray-900">
              {pickInfo.team.name}
            </h4>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
              YOUR PICK
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-700">
            <p className="flex items-center space-x-2">
              <span className="font-medium">Match:</span>
              <span>{pickInfo.venue} vs {pickInfo.opponent.name}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>
                {pickInfo.fixture.kickoffTime.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-medium">Picked on:</span>
              <span>
                {currentPick.timestamp.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </p>
          </div>
        </div>
        
        {/* Visual confirmation */}
        <div className="ml-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <p className="text-xs font-medium text-green-700">Confirmed</p>
        </div>
      </div>
    </div>
  );
};
