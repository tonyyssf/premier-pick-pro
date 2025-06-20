
import React, { useState } from 'react';
import { TeamCard } from './TeamCard';
import { Calendar, Clock } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  opponent: string;
  venue: 'H' | 'A';
  usedCount: number;
}

export const WeeklyPicks: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const teams: Team[] = [
    { id: '1', name: 'Arsenal', opponent: 'Chelsea', venue: 'H', usedCount: 0 },
    { id: '2', name: 'Manchester City', opponent: 'Liverpool', venue: 'A', usedCount: 1 },
    { id: '3', name: 'Manchester United', opponent: 'Tottenham', venue: 'H', usedCount: 2 },
    { id: '4', name: 'Liverpool', opponent: 'Manchester City', venue: 'H', usedCount: 0 },
    { id: '5', name: 'Chelsea', opponent: 'Arsenal', venue: 'A', usedCount: 1 },
    { id: '6', name: 'Tottenham', opponent: 'Manchester United', venue: 'A', usedCount: 0 },
    { id: '7', name: 'Newcastle', opponent: 'Brighton', venue: 'H', usedCount: 0 },
    { id: '8', name: 'Brighton', opponent: 'Newcastle', venue: 'A', usedCount: 1 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-emerald-600 mb-2">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Gameweek 15</span>
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
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-emerald-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Pick</h3>
          <p className="text-gray-600 mb-4">
            You've selected {teams.find(t => t.id === selectedTeam)?.name} to win their match this week.
          </p>
          <div className="flex space-x-4">
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              Submit Pick
            </button>
            <button 
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedTeam(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
