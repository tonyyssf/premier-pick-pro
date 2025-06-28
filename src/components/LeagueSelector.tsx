
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

interface League {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeagueId: string | null;
  onLeagueSelect?: (leagueId: string | null) => void;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  leagues,
  selectedLeagueId,
  onLeagueSelect
}) => {
  const selectedLeague = leagues.find(l => l.id === selectedLeagueId);

  return (
    <div className="mb-6">
      <Select
        value={selectedLeagueId || ''}
        onValueChange={(value) => onLeagueSelect?.(value || null)}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder="Select a league">
            {selectedLeague && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedLeague.name}</span>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Users className="h-3 w-3" />
                  {selectedLeague.member_count}
                </div>
                {selectedLeague.user_rank && (
                  <span className="text-purple-400 text-sm">
                    Rank #{selectedLeague.user_rank}
                  </span>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {leagues.map((league) => (
            <SelectItem key={league.id} value={league.id} className="text-white hover:bg-gray-700">
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium">{league.name}</span>
                <div className="flex items-center gap-1 text-gray-400 text-sm ml-auto">
                  <Users className="h-3 w-3" />
                  {league.member_count}
                </div>
                {league.user_rank && (
                  <span className="text-purple-400 text-sm">
                    #{league.user_rank}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
