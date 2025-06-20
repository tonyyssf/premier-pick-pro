
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';
import { LeagueSettingsTab } from './LeagueSettingsTab';
import { LeagueMembersTab } from './LeagueMembersTab';

interface League {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  is_public: boolean;
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

interface ManageLeagueDialogProps {
  league: League;
  onLeagueUpdated: () => void;
  children: React.ReactNode;
}

export const ManageLeagueDialog: React.FC<ManageLeagueDialogProps> = ({
  league,
  onLeagueUpdated,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  
  // League settings form state
  const [leagueName, setLeagueName] = useState(league.name);
  const [leagueDescription, setLeagueDescription] = useState(league.description || '');
  const [isPublic, setIsPublic] = useState(league.is_public);
  const [maxMembers, setMaxMembers] = useState(league.max_members?.toString() || '');

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      // First get league members
      const { data: leagueMembers, error: membersError } = await supabase
        .from('league_members')
        .select('id, user_id, joined_at')
        .eq('league_id', league.id)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      if (!leagueMembers || leagueMembers.length === 0) {
        setMembers([]);
        return;
      }

      // Get user IDs to fetch profiles
      const userIds = leagueMembers.map(member => member.user_id);

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const membersWithProfiles = leagueMembers.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          ...member,
          profiles: profile ? {
            username: profile.username,
            name: profile.name,
            email: profile.email
          } : null
        };
      });

      setMembers(membersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error Loading Members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchMembers();
    }
  };

  const handleUpdateLeague = async () => {
    setIsLoading(true);
    try {
      const updates: any = {
        name: leagueName,
        description: leagueDescription || null,
        is_public: isPublic,
        max_members: maxMembers ? parseInt(maxMembers) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('leagues')
        .update(updates)
        .eq('id', league.id)
        .eq('creator_id', user?.id);

      if (error) throw error;

      toast({
        title: "League Updated",
        description: "League settings have been updated successfully.",
      });

      onLeagueUpdated();
    } catch (error: any) {
      toast({
        title: "Error Updating League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      toast({
        title: "Cannot Remove Yourself",
        description: "You cannot remove yourself from your own league.",
        variant: "destructive",
      });
      return;
    }

    setRemovingMember(memberId);
    try {
      const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('id', memberId)
        .eq('league_id', league.id);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Member has been removed from the league.",
      });

      fetchMembers();
      onLeagueUpdated();
    } catch (error: any) {
      toast({
        title: "Error Removing Member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const handleLeagueUpdatedAfterDelete = () => {
    setIsOpen(false);
    onLeagueUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Manage League: {league.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">League Settings</TabsTrigger>
            <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <LeagueSettingsTab
              league={league}
              leagueName={leagueName}
              setLeagueName={setLeagueName}
              leagueDescription={leagueDescription}
              setLeagueDescription={setLeagueDescription}
              isPublic={isPublic}
              setIsPublic={setIsPublic}
              maxMembers={maxMembers}
              setMaxMembers={setMaxMembers}
              isLoading={isLoading}
              onUpdateLeague={handleUpdateLeague}
              onLeagueUpdated={handleLeagueUpdatedAfterDelete}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <LeagueMembersTab
              league={league}
              members={members}
              loadingMembers={loadingMembers}
              removingMember={removingMember}
              onRemoveMember={handleRemoveMember}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
