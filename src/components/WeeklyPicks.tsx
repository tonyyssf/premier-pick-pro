
import React, { useState } from 'react';
import { FixtureCard } from './FixtureCard';
import { GameweekHeader } from './GameweekHeader';
import { PickConfirmationCard } from './PickConfirmationCard';
import { usePicks } from '../contexts/PicksContext';

export const WeeklyPicks: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [undoing, setUndoing] = useState(false);
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

  const handleTeamSelect = async (fixtureId: string, teamId: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    await submitPick(fixtureId, teamId);
    setSubmitting(false);
  };

  const handleUndoPick = async () => {
    setUndoing(true);
    await undoPick();
    setUndoing(false);
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

  if (loading || fixturesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plpe-purple"></div>
          <span className="ml-3 text-gray-600">Loading your picks...</span>
        </div>
      </div>
    );
  }

  if (!currentGameweek) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Gameweek</h2>
          <p className="text-gray-600">There's currently no active gameweek to make picks for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-section="weekly-picks">
      <GameweekHeader 
        gameweek={currentGameweek} 
        title={hasAlreadyPicked ? "Your Pick" : "Make Your Pick"} 
      />

      {hasAlreadyPicked && currentPick ? (
        <PickConfirmationCard
          currentPick={currentPick}
          pickInfo={getCurrentPickInfo()}
          canUndo={canUndo}
          undoing={undoing}
          onUndoPick={handleUndoPick}
          gameweekNumber={currentGameweek.number}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      )}
    </div>
  );
};
