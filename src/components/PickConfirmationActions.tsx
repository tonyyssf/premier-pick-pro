
import React, { useState } from 'react';
import { Undo, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Fixture } from '@/types/picks';

interface PickConfirmationActionsProps {
  canUndo: boolean;
  undoing: boolean;
  onUndoPick: () => void;
  pickInfo: {
    fixture: Fixture;
  } | null;
}

export const PickConfirmationActions: React.FC<PickConfirmationActionsProps> = ({
  canUndo,
  undoing,
  onUndoPick,
  pickInfo
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

  if (!canUndo) {
    return null;
  }

  return (
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
      
      {/* Status indicator */}
      {isUrgent && (
        <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium ml-4">
          <AlertTriangle className="h-4 w-4" />
          <span>Change soon!</span>
        </div>
      )}
    </div>
  );
};
