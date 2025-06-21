import React from 'react';
import { CheckCircle, Undo } from 'lucide-react';
import { Button } from './ui/button';
import { Pick, Fixture } from '@/types/picks';
import { SharePickCard } from './SharePickCard';

interface PickConfirmationCardProps {
  currentPick: Pick;
  pickInfo: {
    team: { name: string };
    opponent: { name: string };
    venue: string;
    fixture: Fixture;
  } | null;
  canUndo: boolean;
  undoing: boolean;
  onUndoPick: () => void;
  gameweekNumber?: number;
}

export const PickConfirmationCard: React.FC<PickConfirmationCardProps> = ({
  currentPick,
  pickInfo,
  canUndo,
  undoing,
  onUndoPick,
  gameweekNumber = 1
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pick Confirmed</h3>
              <p className="text-gray-600">You've made your pick for this gameweek</p>
            </div>
          </div>
          {canUndo && (
            <Button
              onClick={onUndoPick}
              variant="outline"
              disabled={undoing}
              className="flex items-center space-x-2"
            >
              <Undo className="h-4 w-4" />
              <span>{undoing ? 'Undoing...' : 'Undo Pick'}</span>
            </Button>
          )}
        </div>
        
        {pickInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{pickInfo.team.name}</h4>
                <p className="text-sm text-gray-600">
                  {pickInfo.venue} vs {pickInfo.opponent.name}
                </p>
                <p className="text-sm text-gray-500">
                  {pickInfo.fixture.kickoffTime.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Picked on</p>
                <p className="text-sm font-medium">
                  {currentPick.timestamp.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {!canUndo && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You can no longer change your pick as the first match of this gameweek has started.
            </p>
          </div>
        )}
      </div>

      {pickInfo && (
        <SharePickCard
          teamName={pickInfo.team.name}
          opponentName={pickInfo.opponent.name}
          venue={pickInfo.venue}
          fixture={pickInfo.fixture}
          gameweekNumber={gameweekNumber}
        />
      )}
    </div>
  );
};
