
import React, { useState } from 'react';
import { usePicks } from '../contexts/PicksContext';
import { StreamlinedFixtureCard } from './StreamlinedFixtureCard';
import { PickConfirmationModal } from './PickConfirmationModal';
import { Button } from './ui/button';
import { Undo } from 'lucide-react';

export const PickFixturesList: React.FC = () => {
  const [selectedPick, setSelectedPick] = useState<{
    fixtureId: string;
    teamId: string;
    team: any;
    opponent: any;
    venue: string;
  } | null>(null);
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

  const handleTeamSelect = (fixtureId: string, teamId: string) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (!fixture) return;
    
    const team = fixture.homeTeam.id === teamId ? fixture.homeTeam : fixture.awayTeam;
    const opponent = fixture.homeTeam.id === teamId ? fixture.awayTeam : fixture.homeTeam;
    const venue = fixture.homeTeam.id === teamId ? 'H' : 'A';
    
    setSelectedPick({ fixtureId, teamId, team, opponent, venue });
  };

  const handleConfirmPick = async () => {
    if (!selectedPick) return;
    
    setSubmitting(true);
    const success = await submitPick(selectedPick.fixtureId, selectedPick.teamId);
    setSubmitting(false);
    
    if (success) {
      setSelectedPick(null);
    }
  };

  const handleCancelPick = () => {
    setSelectedPick(null);
  };

  const handleUndoPick = async () => {
    setUndoing(true);
    await undoPick();
    setUndoing(false);
  };

  if (loading || fixturesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentGameweek) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No active gameweek to make picks for.</p>
      </div>
    );
  }

  if (hasAlreadyPicked && currentPick) {
    const fixture = fixtures.find(f => f.id === currentPick.fixtureId);
    if (fixture) {
      const team = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.homeTeam : fixture.awayTeam;
      const opponent = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.awayTeam : fixture.homeTeam;
      const venue = fixture.homeTeam.id === currentPick.pickedTeamId ? 'H' : 'A';
      
      return (
        <div className="p-4 pb-20">
          <div className="bg-gray-800 rounded-lg p-4 text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Your Pick</h3>
            <div className="text-purple-400 font-medium">{team.name}</div>
            <div className="text-gray-400 text-sm">vs. {opponent.name} ({venue})</div>
          </div>
          {canUndo && (
            <Button 
              onClick={handleUndoPick}
              disabled={undoing}
              variant="outline"
              className="w-full bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              <Undo className="w-4 h-4 mr-2" />
              {undoing ? 'Undoing...' : 'Undo Pick'}
            </Button>
          )}
        </div>
      );
    }
  }

  // Group fixtures by date
  const fixturesByDate = fixtures.reduce((acc, fixture) => {
    const dateKey = fixture.kickoffTime.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(fixture);
    return acc;
  }, {} as Record<string, typeof fixtures>);

  return (
    <div className="pb-20">
      {Object.entries(fixturesByDate).map(([date, dateFixtures]) => (
        <div key={date} className="mb-6">
          <div className="px-4 py-2">
            <h3 className="text-gray-400 text-sm font-medium">{date}</h3>
          </div>
          <div className="space-y-2">
            {dateFixtures.map((fixture) => (
              <StreamlinedFixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeamUsedCount={getTeamUsedCount(fixture.homeTeam.id)}
                awayTeamUsedCount={getTeamUsedCount(fixture.awayTeam.id)}
                maxUses={2}
                onTeamSelect={handleTeamSelect}
              />
            ))}
          </div>
        </div>
      ))}
      
      {selectedPick && (
        <PickConfirmationModal
          pick={selectedPick}
          onConfirm={handleConfirmPick}
          onCancel={handleCancelPick}
          submitting={submitting}
        />
      )}
    </div>
  );
};
