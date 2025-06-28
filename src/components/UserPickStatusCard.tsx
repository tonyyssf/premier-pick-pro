
import React from 'react';
import { usePicks } from '../contexts/PicksContext';
import { Button } from './ui/button';

export const UserPickStatusCard: React.FC = () => {
  const { currentGameweek, hasPickForGameweek, getCurrentPick, fixtures } = usePicks();

  if (!currentGameweek) return null;

  const hasPickForCurrentGameweek = hasPickForGameweek(currentGameweek.id);
  const currentPick = getCurrentPick();

  const getPickInfo = () => {
    if (!currentPick || !fixtures.length) return null;
    
    const fixture = fixtures.find(f => f.id === currentPick.fixtureId);
    if (!fixture) return null;
    
    const team = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.homeTeam : fixture.awayTeam;
    const opponent = fixture.homeTeam.id === currentPick.pickedTeamId ? fixture.awayTeam : fixture.homeTeam;
    const venue = fixture.homeTeam.id === currentPick.pickedTeamId ? 'H' : 'A';
    
    return { team, opponent, venue };
  };

  const pickInfo = getPickInfo();

  return (
    <div className="mx-4 mt-4 p-4 bg-gray-800 rounded-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Pick</h3>
        <span className="text-gray-400 text-sm">GW {currentGameweek.number}</span>
      </div>
      
      {hasPickForCurrentGameweek && pickInfo ? (
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-lg font-semibold mb-1">{pickInfo.team.name}</div>
          <div className="text-gray-400 text-sm">
            vs. {pickInfo.opponent.name} ({pickInfo.venue})
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-gray-400 mb-4">You haven't made a pick yet</div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            onClick={() => {
              const picksSection = document.querySelector('[data-section="weekly-picks"]');
              if (picksSection) {
                picksSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Make Your Pick
          </Button>
        </div>
      )}
    </div>
  );
};
