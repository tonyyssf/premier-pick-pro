
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueSettingsTab } from './LeagueSettingsTab';
import { LeagueMembersTab } from './LeagueMembersTab';

interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  max_members: number | null;
  created_at: string;
  member_count?: number;
  is_creator?: boolean;
  is_member?: boolean;
}

interface LeagueMember {
  id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    username: string | null;
    name: string | null;
    email: string | null;
  } | null;
}

interface LeagueManagementTabsProps {
  league: League;
  members: LeagueMember[];
  loadingMembers: boolean;
  removingMember: string | null;
  onRemoveMember: (memberId: string, memberUserId: string) => void;
  leagueName: string;
  setLeagueName: (name: string) => void;
  leagueDescription: string;
  setLeagueDescription: (description: string) => void;
  maxMembers: string;
  setMaxMembers: (maxMembers: string) => void;
  isLoading: boolean;
  onUpdateLeague: () => void;
  onLeagueUpdated: () => void;
  className?: string;
}

export const LeagueManagementTabs: React.FC<LeagueManagementTabsProps> = ({
  league,
  members,
  loadingMembers,
  removingMember,
  onRemoveMember,
  leagueName,
  setLeagueName,
  leagueDescription,
  setLeagueDescription,
  maxMembers,
  setMaxMembers,
  isLoading,
  onUpdateLeague,
  onLeagueUpdated,
  className
}) => {
  return (
    <div className={className}>
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6 mt-4">
          <LeagueSettingsTab
            league={league}
            leagueName={leagueName}
            setLeagueName={setLeagueName}
            leagueDescription={leagueDescription}
            setLeagueDescription={setLeagueDescription}
            maxMembers={maxMembers}
            setMaxMembers={setMaxMembers}
            isLoading={isLoading}
            onUpdateLeague={onUpdateLeague}
            onLeagueUpdated={onLeagueUpdated}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-4 mt-4">
          <LeagueMembersTab
            league={league}
            members={members}
            loadingMembers={loadingMembers}
            removingMember={removingMember}
            onRemoveMember={onRemoveMember}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
