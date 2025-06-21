
import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronDown, ChevronUp, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface LeagueMembersListProps {
  leagueId: string;
  creatorId: string;
  memberCount: number;
}

export const LeagueMembersList: React.FC<LeagueMembersListProps> = ({
  leagueId,
  creatorId,
  memberCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (members.length > 0) return; // Don't refetch if we already have data

    setLoading(true);
    try {
      // First get league members
      const { data: leagueMembers, error: membersError } = await supabase
        .from('league_members')
        .select('id, user_id, joined_at')
        .eq('league_id', leagueId)
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
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && members.length === 0) {
      fetchMembers();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="w-full justify-between p-2 h-auto"
        >
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">View Members ({memberCount})</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">No members found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {member.profiles?.name || member.profiles?.username || 'Unknown User'}
                      {member.user_id === creatorId && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Creator
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
