
import React from 'react';
import { Button } from './ui/button';

interface PickSelectionCardProps {
  selectedTeam: string | null;
  selectedFixture: string | null;
  teamInfo: {
    team: { name: string };
    opponent: { name: string };
    venue: string;
  } | null;
  submitting: boolean;
  onSubmitPick: () => void;
  onCancel: () => void;
}

export const PickSelectionCard: React.FC<PickSelectionCardProps> = ({
  selectedTeam,
  selectedFixture,
  teamInfo,
  submitting,
  onSubmitPick,
  onCancel
}) => {
  if (!selectedTeam || !selectedFixture) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-plpe-purple">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Pick</h3>
      {teamInfo && (
        <p className="text-gray-600 mb-4">
          You've selected {teamInfo.team.name} to win their {teamInfo.venue.toLowerCase()} match against {teamInfo.opponent.name}.
        </p>
      )}
      <div className="flex space-x-4">
        <Button 
          onClick={onSubmitPick}
          className="bg-plpe-purple hover:bg-purple-700"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Pick'}
        </Button>
        <Button 
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
