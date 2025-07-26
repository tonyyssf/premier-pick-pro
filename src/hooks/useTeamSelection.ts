import { useState, useEffect, useRef } from 'react';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup function
  const clearLoadingState = (teamId?: string) => {
    if (mountedRef.current && (!teamId || localSubmitting === teamId)) {
      console.log('Clearing loading state for:', teamId || 'all teams');
      setLocalSubmitting(null);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Force clear all loading states (can be called from parent)
  const forceResetLoading = () => {
    console.log('Force resetting loading state for fixture:', fixtureId);
    clearLoadingState();
  };

  // Clear loading state when external submitting prop changes
  useEffect(() => {
    if (!submitting && localSubmitting) {
      console.log('External submitting finished, clearing local state for:', localSubmitting);
      clearLoadingState();
    }
  }, [submitting, localSubmitting]);

  // Clear loading state when fixture changes
  useEffect(() => {
    clearLoadingState();
  }, [fixtureId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTeamSelect = async (teamId: string, isDisabled: boolean) => {
    console.log('Team selection attempt:', {
      teamId,
      fixtureId,
      isDisabled,
      hasStarted,
      disabled,
      localSubmitting,
      submitting
    });

    // Prevent selection if disabled or already in progress
    if (isDisabled || hasStarted || disabled || localSubmitting || submitting) {
      console.log('Team selection blocked due to constraints');
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set loading state
    setLocalSubmitting(teamId);
    console.log('Setting loading state for team:', teamId);

    // Set timeout to auto-clear loading state (fallback)
    timeoutRef.current = setTimeout(() => {
      console.log('Timeout reached, force clearing loading state for:', teamId);
      clearLoadingState(teamId);
    }, 10000); // 10 second timeout

    try {
      console.log('Calling onTeamSelect for:', teamId);
      await onTeamSelect(fixtureId, teamId);
      console.log('onTeamSelect completed successfully for:', teamId);
    } catch (error) {
      console.error('Error in onTeamSelect for team:', teamId, error);
      // Don't rethrow - let the calling component handle it
    } finally {
      // Always clear the loading state
      if (mountedRef.current) {
        clearLoadingState(teamId);
      }
    }
  };

  return {
    localSubmitting,
    handleTeamSelect,
    forceResetLoading,
    isLoading: (teamId: string) => localSubmitting === teamId
  };
};