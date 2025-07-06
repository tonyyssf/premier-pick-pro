
import React, { useState } from 'react';
import { CheckCircle, Undo, Clock, AlertTriangle, Shield, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Pick, Fixture } from '@/types/picks';

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
  const [showUndoConfirmation, setShowUndoConfirmation] = useState(false);

  const handleUndoClick = () => {
    if (showUndoConfirmation) {
      onUndoPick();
      setShowUndoConfirmation(false);
    } else {
      setShowUndoConfirmation(true);
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowUndoConfirmation(false), 5000);
    }
  };

  const timeUntilKickoff = pickInfo ? pickInfo.fixture.kickoffTime.getTime() - new Date().getTime() : 0;
  const hoursUntilKickoff = timeUntilKickoff / (1000 * 60 * 60);
  const isUrgent = hoursUntilKickoff <= 2 && hoursUntilKickoff > 0;

  return (
    <Card className="bg-white shadow-lg border-l-4 border-green-500">
      <CardContent className="p-6">
        {/* Success Header */}
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
        
        {/* Pick Details */}
        {pickInfo && (
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
        )}

        {/* Action buttons and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {canUndo ? (
              <div className="flex items-center space-x-3">
                {!showUndoConfirmation ? (
                  <Button
                    onClick={handleUndoClick}
                    variant="outline"
                    disabled={undoing}
                    className="flex items-center space-x-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Undo className="h-4 w-4" />
                    <span>Change Pick</span>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handleUndoClick}
                      variant="destructive"
                      disabled={undoing}
                      className="flex items-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>{undoing ? 'Undoing...' : 'Confirm Undo'}</span>
                    </Button>
                    <Button
                      onClick={() => setShowUndoConfirmation(false)}
                      variant="outline"
                      className="text-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Pick locked - match started</span>
              </div>
            )}
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            {isUrgent && canUndo && (
              <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>Change soon!</span>
              </div>
            )}
          </div>
        </div>

        {/* Information panel */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Your pick is automatically locked when the match starts</li>
                <li>• Points are awarded after the match ends</li>
                {canUndo && <li>• You can change your pick until the first match begins</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Locked state warning */}
        {!canUndo && (
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
        )}
      </CardContent>
    </Card>
  );
};
