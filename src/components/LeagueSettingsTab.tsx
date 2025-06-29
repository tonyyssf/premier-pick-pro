
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LeagueInviteCodeSection } from './LeagueInviteCodeSection';
import { LeagueShareSection } from './LeagueShareSection';
import { LeagueDeleteSection } from './LeagueDeleteSection';
import type { League } from '@/types/league';

interface LeagueSettingsTabProps {
  league: League;
  leagueName: string;
  setLeagueName: (name: string) => void;
  leagueDescription: string;
  setLeagueDescription: (description: string) => void;
  maxMembers: string;
  setMaxMembers: (maxMembers: string) => void;
  isLoading: boolean;
  onUpdateLeague: () => void;
  onLeagueUpdated: () => void;
}

export const LeagueSettingsTab: React.FC<LeagueSettingsTabProps> = ({
  league,
  leagueName,
  setLeagueName,
  leagueDescription,
  setLeagueDescription,
  maxMembers,
  setMaxMembers,
  isLoading,
  onUpdateLeague,
  onLeagueUpdated
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="league-name">League Name</Label>
          <Input
            id="league-name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            placeholder="Enter league name"
          />
        </div>

        <div>
          <Label htmlFor="league-description">Description</Label>
          <Textarea
            id="league-description"
            value={leagueDescription}
            onChange={(e) => setLeagueDescription(e.target.value)}
            placeholder="Enter league description (optional)"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="max-members">Maximum Members</Label>
          <Input
            id="max-members"
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            placeholder="Maximum 20 members"
            min="1"
            max="20"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum of 20 members allowed per league</p>
        </div>

        <LeagueInviteCodeSection inviteCode={league.invite_code} />

        <LeagueShareSection leagueId={league.id} leagueName={league.name} />

        <Button 
          onClick={onUpdateLeague} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Updating...' : 'Update League Settings'}
        </Button>

        <LeagueDeleteSection league={league} onLeagueUpdated={onLeagueUpdated} />
      </div>
    </div>
  );
};
