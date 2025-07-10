
import React, { useState } from 'react';
import { PickConfirmationCard } from './PickConfirmationCard';
import { usePicks } from '../contexts/PicksContext';
import { WeeklyPicksHeader } from './WeeklyPicksHeader';
import { WeeklyPicksMessages } from './WeeklyPicksMessages';
import { WeeklyPicksInstructions } from './WeeklyPicksInstructions';
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
    submitPick, 
    undoPick,
    canUndoPick,
    getTeamUsedCount, 
    hasPickForGameweek, 
    getCurrentPick, 
    loading, 
    fixturesLoading 
  } = usePicks();

  const currentPick = getCurrentPick();
  const hasAlreadyPicked = currentGameweek ? hasPickForGameweek(currentGameweek.id) : false;
  const canUndo = canUndoPick();

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
    if (submitting) return;
    
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
  if (!currentGameweek) {
    return <WeeklyPicksEmptyState />;
  }

  // Check if deadline has passed
  const deadlinePassed = new Date() > currentGameweek.deadline;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
      <WeeklyPicksHeader 
        currentGameweek={currentGameweek}
        hasAlreadyPicked={hasAlreadyPicked}
      />

      <WeeklyPicksMessages
        successMessage={successMessage}
        lastError={lastError}
        onDismissError={() => setLastError(null)}
      />

      {/* Deadline passed warning */}
      {deadlinePassed && !hasAlreadyPicked && (
        <WeeklyPicksDeadlinePassed gameweekNumber={currentGameweek.number} />
      )}

      {/* Main content */}
      {hasAlreadyPicked && currentPick ? (
        <PickConfirmationCard
          currentPick={currentPick}
          pickInfo={getCurrentPickInfo()}
          canUndo={canUndo && !deadlinePassed}
          undoing={undoing}
          onUndoPick={handleUndoPick}
          gameweekNumber={currentGameweek.number}
        />
      ) : !deadlinePassed ? (
        <>
          {/* Instructions for first-time users */}
          {fixtures.length > 0 && <WeeklyPicksInstructions />}

          {/* Fixture list */}
          <WeeklyPicksFixtureList
            fixtures={fixtures}
            getTeamUsedCount={getTeamUsedCount}
            onTeamSelect={handleTeamSelect}
            submitting={submitting}
            gameweekNumber={currentGameweek.number}
          />
        </>
      ) : null}
    </div>
  );
};
