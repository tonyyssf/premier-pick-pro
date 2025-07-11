
import React from 'react';
import { Clock } from 'lucide-react';
import { Pick, Fixture } from '@/types/picks';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
      <div className="space-y-3 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">
              {pickInfo.team.name}
            </h4>
            <p className="text-sm text-gray-700">
              vs {pickInfo.opponent.name}
            </p>
          </div>
        </div>
        
        <div className={`grid gap-2 text-sm text-gray-600 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {pickInfo.fixture.kickoffTime.toLocaleDateString('en-GB', {
                weekday: isMobile ? 'short' : 'long',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="font-medium">Picked:</span>
            <span>
              {currentPick.timestamp.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
