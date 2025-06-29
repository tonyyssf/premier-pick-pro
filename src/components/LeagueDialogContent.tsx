
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LeagueAccessDenied } from './LeagueAccessDenied';
import { LeagueManagementTabs } from './LeagueManagementTabs';

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

interface LeagueDialogContentProps {
  league: League;
  members: LeagueMember[];
  setMembers: (members: LeagueMember[]) => void;
  loadingMembers: boolean;
  setLoadingMembers: (loading: boolean) => void;
  onLeagueUpdated: () => void;
  className?: string;
}

export const LeagueDialogContent: React.FC<LeagueDialogContentProps> = ({
  league,
  members,
  setMembers,
  loadingMembers,
  setLoadingMembers,
  onLeagueUpdated,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  
  // League settings form state
  const [leagueName, setLeagueName] = useState(league.name);
  const [leagueDescription, setLeagueDescription] = useState(league.description || '');
  const [maxMembers, setMaxMembers] = useState(league.max_members?.toString() || '20');

  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user is the league creator
  const isCreator = user?.id === league.creator_id;

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

  const handleUpdateLeague = async () => {
    if (!isCreator) {
      toast({
        title: "Access Denied",
        description: "Only the league creator can update settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updates: any = {
        name: leagueName,
        description: leagueDescription || null,
        max_members: maxMembers ? parseInt(maxMembers) : 20,
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
    if (!isCreator) {
      toast({
        title: "Access Denied",
        description: "Only the league creator can remove members.",
        variant: "destructive",
      });
      return;
    }

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
    onLeagueUpdated();
  };

  // Initialize members fetch
  React.useEffect(() => {
    if (members.length === 0) {
      fetchMembers();
    }
  }, []);

  // If not creator, show access denied message
  if (!isCreator) {
    return (
      <LeagueAccessDenied
        league={league}
        members={members}
        loadingMembers={loadingMembers}
        className={className}
      />
    );
  }

  return (
    <LeagueManagementTabs
      league={league}
      members={members}
      loadingMembers={loadingMembers}
      removingMember={removingMember}
      onRemoveMember={handleRemoveMember}
      leagueName={leagueName}
      setLeagueName={setLeagueName}
      leagueDescription={leagueDescription}
      setLeagueDescription={setLeagueDescription}
      maxMembers={maxMembers}
      setMaxMembers={setMaxMembers}
      isLoading={isLoading}
      onUpdateLeague={handleUpdateLeague}
      onLeagueUpdated={handleLeagueUpdatedAfterDelete}
      className={className}
    />
  );
};
