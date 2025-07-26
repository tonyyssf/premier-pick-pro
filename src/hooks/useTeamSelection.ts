import { useState } from 'react';

interface UseTeamSelectionOptions {
  onTeamSelect: (fixtureId: string, teamId: string) => void;
  fixtureId: string;
  submitting?: boolean;
  disabled?: boolean;
  hasStarted?: boolean;
}

export const useTeamSelection = ({
  onTeamSelect,
  fixtureId,
  submitting = false,
  disabled = false,
  hasStarted = false
}: UseTeamSelectionOptions) => {
  const [localSubmitting, setLocalSubmitting] = useState<string | null>(null);

  const handleTeamSelect = async (teamId: string, isDisabled: boolean) => {
    // Prevent selection if disabled or already in progress
    if (isDisabled || hasStarted || disabled || localSubmitting || submitting) {
      return;
    }

    // Set loading state
    setLocalSubmitting(teamId);

    try {
      await onTeamSelect(fixtureId, teamId);
    } catch (error) {
      console.error('Error in onTeamSelect for team:', teamId, error);
    } finally {
      // Always clear the loading state
      setLocalSubmitting(null);
    }
  };

  return {
    localSubmitting,
    handleTeamSelect,
    forceResetLoading: () => setLocalSubmitting(null),
    isLoading: (teamId: string) => localSubmitting === teamId
  };
};