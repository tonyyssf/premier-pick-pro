
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LeagueInviteCodeSection } from './LeagueInviteCodeSection';
import { LeagueShareSection } from './LeagueShareSection';
import { LeagueDeleteSection } from './LeagueDeleteSection';

interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  is_public: boolean;
  max_members: number | null;
}

interface LeagueSettingsTabProps {
  league: League;
  leagueName: string;
  setLeagueName: (name: string) => void;
  leagueDescription: string;
  setLeagueDescription: (description: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
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
  isPublic,
  setIsPublic,
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

        <div className="flex items-center space-x-2">
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="is-public">Make league public</Label>
        </div>

        <div>
          <Label htmlFor="max-members">Maximum Members (optional)</Label>
          <Input
            id="max-members"
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
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
