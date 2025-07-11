
import React, { useState } from 'react';
import { Undo, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Fixture } from '@/types/picks';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const handleUndoClick = () => {
    if (showUndoConfirmation) {
      onUndoPick();
      setShowUndoConfirmation(false);
    } else {
      setShowUndoConfirmation(true);
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
    <div className="flex flex-col items-center space-y-3">
      {!showUndoConfirmation ? (
        <Button
          onClick={handleUndoClick}
          variant="outline"
          disabled={undoing}
          size={isMobile ? "sm" : "default"}
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <Undo className="h-4 w-4 mr-2" />
          Change Pick
        </Button>
      ) : (
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row space-x-2'} items-center`}>
          <Button
            onClick={handleUndoClick}
            variant="destructive"
            disabled={undoing}
            size={isMobile ? "sm" : "default"}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {undoing ? 'Undoing...' : 'Confirm'}
          </Button>
          <Button
            onClick={() => setShowUndoConfirmation(false)}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="text-gray-600"
          >
            Cancel
          </Button>
        </div>
      )}
      
      {isUrgent && (
        <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-xs font-medium">
          <AlertTriangle className="h-3 w-3" />
          <span>Change soon!</span>
        </div>
      )}
    </div>
  );
};
