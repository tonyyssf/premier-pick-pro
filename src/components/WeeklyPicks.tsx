
import React, { useState } from 'react';
import { PickConfirmationCard } from './PickConfirmationCard';
import { usePicks } from '../contexts/PicksContext';
import { WeeklyPicksHeader } from './WeeklyPicksHeader';
import { WeeklyPicksMessages } from './WeeklyPicksMessages';
import { WeeklyPicksFixtureList } from './WeeklyPicksFixtureList';
import { WeeklyPicksLoadingState } from './WeeklyPicksLoadingState';
import { WeeklyPicksEmptyState } from './WeeklyPicksEmptyState';
import { WeeklyPicksDeadlinePassed } from './WeeklyPicksDeadlinePassed';

export const WeeklyPicks: React.FC = () => {
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

  const gameweekToUse = viewingGameweek || currentGameweek;
  const isCurrentGameweek = currentGameweek && gameweekToUse && currentGameweek.id === gameweekToUse.id;
  const currentPick = getCurrentPick();
  const hasAlreadyPicked = gameweekToUse ? hasPickForGameweek(gameweekToUse.id) : false;
  const canUndo = canUndoPick();
  
  console.log('WeeklyPicks state:', {
    currentGameweek: currentGameweek?.number,
    viewingGameweek: viewingGameweek?.number,
    isCurrentGameweek,
    hasAlreadyPicked,
    canUndo,
    fixtures: fixtures?.length
  });

  // Clear messages after delay
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (lastError) {
      const timer = setTimeout(() => setLastError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  const handleTeamSelect = async (fixtureId: string, teamId: string) => {
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
  };

  const handleUndoPick = async () => {
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
  };

  const getCurrentPickInfo = () => {
    if (!currentPick) return null;
    
    const fixture = fixtures.find(f => f.id === currentPick.fixtureId);
    if (!fixture) return null;
    
    const team = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.homeTeam : fixture.awayTeam;
    const opponent = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.awayTeam : fixture.homeTeam;
    const venue = fixture.homeTeam.id === currentPick.pickedTeamId ? 'Home' : 'Away';
    
    return { team, opponent, venue, fixture };
  };

  // Loading state
  if (loading || fixturesLoading) {
    return <WeeklyPicksLoadingState />;
  }

  // No gameweek state
  if (!currentGameweek || !gameweekToUse) {
    return <WeeklyPicksEmptyState />;
  }

  // Check if deadline has passed for current gameweek
  const deadlinePassed = isCurrentGameweek && new Date() > gameweekToUse.deadline;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-section="weekly-picks">
      <WeeklyPicksHeader 
        currentGameweek={currentGameweek}
        viewingGameweek={gameweekToUse}
        hasAlreadyPicked={hasAlreadyPicked}
        onNavigate={navigation?.navigateToGameweek}
        canNavigatePrev={navigation?.canNavigatePrev}
        canNavigateNext={navigation?.canNavigateNext}
        isNavigating={navigation?.isNavigating}
      />

      <WeeklyPicksMessages
        successMessage={successMessage}
        lastError={lastError}
        onDismissError={() => setLastError(null)}
      />

      {/* Deadline passed warning - only for current gameweek */}
      {deadlinePassed && !hasAlreadyPicked && (
        <WeeklyPicksDeadlinePassed gameweekNumber={gameweekToUse.number} />
      )}

      {/* Main content */}
      {hasAlreadyPicked && currentPick && isCurrentGameweek ? (
        <PickConfirmationCard
          currentPick={currentPick}
          pickInfo={getCurrentPickInfo()}
          canUndo={canUndo && !deadlinePassed}
          undoing={undoing}
          onUndoPick={handleUndoPick}
          gameweekNumber={gameweekToUse.number}
        />
      ) : !deadlinePassed || !isCurrentGameweek ? (
        <>
          {/* Fixture list */}
          <WeeklyPicksFixtureList
            fixtures={fixtures}
            getTeamUsedCount={getTeamUsedCount}
            onTeamSelect={handleTeamSelect}
            submitting={submitting}
            gameweekNumber={gameweekToUse.number}
            disabled={!isCurrentGameweek}
          />
        </>
      ) : null}
    </div>
  );
};
