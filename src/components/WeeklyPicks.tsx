
import React, { useState } from 'react';
import { FixtureCard } from './FixtureCard';
import { GameweekHeader } from './GameweekHeader';
import { PickConfirmationCard } from './PickConfirmationCard';
import { DeadlineCard } from './DeadlineCard';
import { usePicks } from '../contexts/PicksContext';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading your picks...</h3>
            <p className="text-gray-600">Please wait while we fetch the latest data</p>
          </div>
        </div>
      </div>
    );
  }

  // No gameweek state
  if (!currentGameweek) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Gameweek</h2>
            <p className="text-gray-600 mb-6">
              There's currently no active gameweek to make picks for. 
              Check back when the next gameweek opens!
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Page</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if deadline has passed
  const deadlinePassed = new Date() > currentGameweek.deadline;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
      <GameweekHeader 
        gameweek={currentGameweek} 
        title={hasAlreadyPicked ? "Your Pick" : "Make Your Pick"} 
      />

      <DeadlineCard 
        deadline={currentGameweek.deadline} 
        gameweekNumber={currentGameweek.number} 
      />

      {/* Success Message */}
      {successMessage && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {lastError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Unable to process your pick</p>
                  <p className="text-red-700 text-sm">{lastError}</p>
                </div>
              </div>
              <Button 
                onClick={() => setLastError(null)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deadline passed warning */}
      {deadlinePassed && !hasAlreadyPicked && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900 mb-2">Deadline Passed</h3>
            <p className="text-red-800">
              The deadline for Gameweek {currentGameweek.number} has passed. 
              You can no longer make picks for this round.
            </p>
          </CardContent>
        </Card>
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
          {fixtures.length > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    i
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to make your pick:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Choose one team from any match below</li>
                      <li>Click on the team you think will win</li>
                      <li>Your pick will be confirmed automatically</li>
                      <li>You can change your pick until the first match starts</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {fixtures.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeamUsedCount={getTeamUsedCount(fixture.homeTeam.id)}
                awayTeamUsedCount={getTeamUsedCount(fixture.awayTeam.id)}
                maxUses={2}
                selectedTeam={null}
                onTeamSelect={handleTeamSelect}
                submitting={submitting}
              />
            ))}
          </div>

          {/* Progress indicator */}
          {fixtures.length === 0 && (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fixtures Available</h3>
                <p className="text-gray-600">
                  Fixtures for Gameweek {currentGameweek.number} haven't been scheduled yet.
                  Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
};
