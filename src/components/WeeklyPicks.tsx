
import React, { useState } from 'react';
import { TeamCard } from './TeamCard';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { usePicks } from '../contexts/PicksContext';
import { Button } from './ui/button';

interface Team {
  id: string;
  name: string;
  opponent: string;
  venue: 'H' | 'A';
  usedCount: number;
}

export const WeeklyPicks: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { submitPick, getTeamUsedCount, hasPickForGameweek, getCurrentPick, currentGameweek } = usePicks();
  
  const teams: Team[] = [
    { id: '1', name: 'Arsenal', opponent: 'Chelsea', venue: 'H' as const, usedCount: 0 },
    { id: '2', name: 'Manchester City', opponent: 'Liverpool', venue: 'A' as const, usedCount: 0 },
    { id: '3', name: 'Manchester United', opponent: 'Tottenham', venue: 'H' as const, usedCount: 0 },
    { id: '4', name: 'Liverpool', opponent: 'Manchester City', venue: 'H' as const, usedCount: 0 },
    { id: '5', name: 'Chelsea', opponent: 'Arsenal', venue: 'A' as const, usedCount: 0 },
    { id: '6', name: 'Tottenham', opponent: 'Manchester United', venue: 'A' as const, usedCount: 0 },
    { id: '7', name: 'Newcastle', opponent: 'Brighton', venue: 'H' as const, usedCount: 0 },
    { id: '8', name: 'Brighton', opponent: 'Newcastle', venue: 'A' as const, usedCount: 0 },
  ].map(team => ({
    ...team,
    usedCount: getTeamUsedCount(team.id)
  }));

  const currentPick = getCurrentPick();
  const hasAlreadyPicked = hasPickForGameweek(currentGameweek);

  const handleSubmitPick = () => {
    const team = teams.find(t => t.id === selectedTeam);
    if (team) {
      const success = submitPick(team);
      if (success) {
        setSelectedTeam(null);
      }
    }
  };

  if (hasAlreadyPicked && currentPick) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-plpe-purple mb-2">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Gameweek {currentGameweek}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Pick</h2>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Deadline: Saturday, 12:30 PM GMT</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pick Confirmed</h3>
              <p className="text-gray-600">You've made your pick for this gameweek</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{currentPick.teamName}</h4>
                <p className="text-sm text-gray-600">
                  {currentPick.venue === 'H' ? 'vs' : '@'} {currentPick.opponent}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Picked on</p>
                <p className="text-sm font-medium">
                  {currentPick.timestamp.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-plpe-purple mb-2">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Gameweek {currentGameweek}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Make Your Pick</h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Deadline: Saturday, 12:30 PM GMT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            name={team.name}
            logo=""
            opponent={team.opponent}
            venue={team.venue}
            usedCount={team.usedCount}
            maxUses={2}
            isSelected={selectedTeam === team.id}
            onSelect={() => setSelectedTeam(team.id)}
          />
        ))}
      </div>

      {selectedTeam && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-plpe-purple">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Pick</h3>
          <p className="text-gray-600 mb-4">
            You've selected {teams.find(t => t.id === selectedTeam)?.name} to win their match this week.
          </p>
          <div className="flex space-x-4">
            <Button 
              onClick={handleSubmitPick}
              className="bg-plpe-purple hover:bg-purple-700"
            >
              Submit Pick
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedTeam(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
