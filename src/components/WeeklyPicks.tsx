
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PickConfirmationCard } from './PickConfirmationCard';
import { usePicks } from '../contexts/PicksContext';
import { useAuth } from '../contexts/AuthContext';
import { WeeklyPicksHeader } from './WeeklyPicksHeader';
import { WeeklyPicksMessages } from './WeeklyPicksMessages';
import { WeeklyPicksFixtureList } from './WeeklyPicksFixtureList';
import { WeeklyPicksLoadingState } from './WeeklyPicksLoadingState';
import { WeeklyPicksEmptyState } from './WeeklyPicksEmptyState';
import { WeeklyPicksDeadlinePassed } from './WeeklyPicksDeadlinePassed';
import { GuestWeeklyPicks } from './GuestWeeklyPicks';

export const WeeklyPicks: React.FC = React.memo(() => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { 
    fixtures, 
    currentGameweek,
    viewingGameweek,
    submitPick, 
    undoPick,
    canUndoPick,
    getTeamUsedCount, 
    hasPickForGameweek, 
    getCurrentPick, 
    loading, 
    fixturesLoading,
    navigation
  } = usePicks();

  // Memoized derived state
  const gameweekToUse = useMemo(() => viewingGameweek || currentGameweek, [viewingGameweek, currentGameweek]);
  
  const isCurrentGameweek = useMemo(() => 
    currentGameweek && gameweekToUse && currentGameweek.id === gameweekToUse.id,
    [currentGameweek, gameweekToUse]
  );
  
  const currentPick = useMemo(() => getCurrentPick(), [getCurrentPick]);
  
  const hasAlreadyPicked = useMemo(() => 
    gameweekToUse ? hasPickForGameweek(gameweekToUse.id) : false,
    [gameweekToUse, hasPickForGameweek]
  );
  
  const canUndo = useMemo(() => canUndoPick(), [canUndoPick]);
  
  const deadlinePassed = useMemo(() => 
    isCurrentGameweek && new Date() > gameweekToUse.deadline,
    [isCurrentGameweek, gameweekToUse]
  );

  // Memoized current pick info
  const currentPickInfo = useMemo(() => {
    if (!currentPick) return null;
    
    const fixture = fixtures.find(f => f.id === currentPick.fixtureId);
    if (!fixture) return null;
    
    const team = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.homeTeam : fixture.awayTeam;
    const opponent = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.awayTeam : fixture.homeTeam;
    const venue = fixture.homeTeam.id === currentPick.pickedTeamId ? 'Home' : 'Away';
    
    return { team, opponent, venue, fixture };
  }, [currentPick, fixtures]);

  // Memoized navigation props
  const navigationProps = useMemo(() => ({
    onNavigate: navigation?.navigateToGameweek,
    canNavigatePrev: navigation?.canNavigatePrev,
    canNavigateNext: navigation?.canNavigateNext,
    isNavigating: navigation?.isNavigating,
  }), [navigation]);

  // Optimized event handlers (moved before their usage)
  const handleTeamSelect = useCallback(async (fixtureId: string, teamId: string) => {
    if (submitting || !isCurrentGameweek) return;
    
    setSubmitting(true);
    setLastError(null);
    
    try {
      const success = await submitPick(fixtureId, teamId);
      if (success) {
        const fixture = fixtures.find(f => f.id === fixtureId);
        const team = fixture?.homeTeam.id === teamId ? fixture.homeTeam : fixture?.awayTeam;
        setSuccessMessage(`✅ Successfully picked ${team?.name} to win!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setLastError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, isCurrentGameweek, submitPick, fixtures]);

  const handleUndoPick = useCallback(async () => {
    setUndoing(true);
    setLastError(null);
    
    try {
      const success = await undoPick();
      if (success) {
        setSuccessMessage('Pick successfully removed. You can now make a new selection.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to undo pick';
      setLastError(errorMessage);
    } finally {
      setUndoing(false);
    }
  }, [undoPick]);

  // Memoized header props
  const headerProps = useMemo(() => ({
    currentGameweek,
    viewingGameweek: gameweekToUse,
    hasAlreadyPicked,
    ...navigationProps,
  }), [currentGameweek, gameweekToUse, hasAlreadyPicked, navigationProps]);

  // Memoized messages props
  const messagesProps = useMemo(() => ({
    successMessage,
    lastError,
    onDismissError: () => setLastError(null),
  }), [successMessage, lastError]);

  // Memoized fixture list props
  const fixtureListProps = useMemo(() => ({
    fixtures,
    getTeamUsedCount,
    onTeamSelect: handleTeamSelect,
    submitting,
    gameweekNumber: gameweekToUse.number,
    disabled: !isCurrentGameweek,
  }), [fixtures, getTeamUsedCount, handleTeamSelect, submitting, gameweekToUse.number, isCurrentGameweek]);

  // Memoized pick confirmation props
  const pickConfirmationProps = useMemo(() => ({
    currentPick,
    pickInfo: currentPickInfo,
    canUndo: canUndo && !deadlinePassed,
    undoing,
    onUndoPick: handleUndoPick,
    gameweekNumber: gameweekToUse.number,
  }), [currentPick, currentPickInfo, canUndo, deadlinePassed, undoing, handleUndoPick, gameweekToUse.number]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(() => setLastError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  // Show guest version if not authenticated
  if (!user) {
    return <GuestWeeklyPicks />;
  }

  // Loading state
  if (loading || fixturesLoading) {
    return <WeeklyPicksLoadingState />;
  }

  // No gameweek state
  if (!currentGameweek || !gameweekToUse) {
    return <WeeklyPicksEmptyState />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-section="weekly-picks">
      <WeeklyPicksHeader {...headerProps} />

      <WeeklyPicksMessages {...messagesProps} />

      {/* Deadline passed warning - only for current gameweek */}
      {deadlinePassed && !hasAlreadyPicked && (
        <WeeklyPicksDeadlinePassed gameweekNumber={gameweekToUse.number} />
      )}

      {/* Main content */}
      {hasAlreadyPicked && currentPick && isCurrentGameweek ? (
        <PickConfirmationCard {...pickConfirmationProps} />
      ) : !deadlinePassed || !isCurrentGameweek ? (
        <WeeklyPicksFixtureList {...fixtureListProps} />
      ) : null}
    </div>
  );
});

WeeklyPicks.displayName = 'WeeklyPicks';
