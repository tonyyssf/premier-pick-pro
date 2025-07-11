
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Pick, Fixture } from '@/types/picks';
import { PickConfirmationHeader } from './PickConfirmationHeader';
import { PickConfirmationDetails } from './PickConfirmationDetails';
import { PickConfirmationActions } from './PickConfirmationActions';
import { PickConfirmationLocked } from './PickConfirmationLocked';

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
    <Card className="bg-white shadow-md border-l-4 border-green-500">
      <CardContent className="p-4 space-y-4">
        <PickConfirmationHeader gameweekNumber={gameweekNumber} />
        
        {pickInfo && (
          <PickConfirmationDetails 
            currentPick={currentPick} 
            pickInfo={pickInfo} 
          />
        )}

        <div className="flex justify-center pt-2">
          {canUndo ? (
            <PickConfirmationActions
              canUndo={canUndo}
              undoing={undoing}
              onUndoPick={onUndoPick}
              pickInfo={pickInfo}
            />
          ) : (
            <PickConfirmationLocked />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
