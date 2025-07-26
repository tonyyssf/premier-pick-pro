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

  console.log(`[useTeamSelection] Fixture ${fixtureId} - localSubmitting:`, localSubmitting, 'submitting:', submitting);

  const handleTeamSelect = async (teamId: string, isDisabled: boolean) => {
    console.log(`[useTeamSelection] handleTeamSelect called for team ${teamId} in fixture ${fixtureId}`, {
      isDisabled,
      hasStarted,
      disabled,
      localSubmitting,
      submitting
    });

    // Prevent selection if disabled or already in progress
    if (isDisabled || hasStarted || disabled || localSubmitting || submitting) {
      console.log(`[useTeamSelection] Selection blocked for team ${teamId}`);
      return;
    }

    // Set loading state
    console.log(`[useTeamSelection] Setting loading state for team ${teamId}`);
    setLocalSubmitting(teamId);

    try {
      console.log(`[useTeamSelection] Calling onTeamSelect for team ${teamId}`);
      await onTeamSelect(fixtureId, teamId);
      console.log(`[useTeamSelection] onTeamSelect completed for team ${teamId}`);
    } catch (error) {
      console.error(`[useTeamSelection] Error in onTeamSelect for team ${teamId}:`, error);
    } finally {
      // Always clear the loading state
      console.log(`[useTeamSelection] Clearing loading state for team ${teamId}`);
      setLocalSubmitting(null);
    }
  };

  return {
    localSubmitting,
    handleTeamSelect,
    forceResetLoading: () => {
      console.log(`[useTeamSelection] Force resetting loading for fixture ${fixtureId}`);
      setLocalSubmitting(null);
    },
    isLoading: (teamId: string) => {
      const isLoading = localSubmitting === teamId;
      if (isLoading) {
        console.log(`[useTeamSelection] Team ${teamId} is loading in fixture ${fixtureId}`);
      }
      return isLoading;
    }
  };
};