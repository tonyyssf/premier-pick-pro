
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeagueMember {
  id: string;
  user_id: string;
  joined_at: string;
  profiles: {
    username: string;
    name: string;
    email: string;
  } | null;
}

interface LeagueMembersListProps {
  leagueId: string;
  creatorId: string;
  memberCount: number;
}

// Memoized member card component
const MemberCard = React.memo<{
  member: LeagueMember;
  isCreator: boolean;
}>(({ member, isCreator }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-plpe-purple rounded-full flex items-center justify-center">
        <span className="text-white font-semibold text-sm">
          {member.profiles?.username?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
      <div>
        <div className="font-semibold text-gray-900 flex items-center gap-2">
          {member.profiles?.username || 'Unknown User'}
          {isCreator && (
            <Badge variant="default" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Creator
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {member.profiles?.name || 'No name provided'}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        Joined {new Date(member.joined_at).toLocaleDateString()}
      </div>
    </div>
  </div>
));

MemberCard.displayName = 'MemberCard';

export const LeagueMembersList: React.FC<LeagueMembersListProps> = React.memo(({
  leagueId,
  creatorId,
  memberCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Memoized fetch function
  const fetchMembers = useCallback(async () => {
    if (members.length > 0) return; // Don't refetch if we already have data

    setLoading(true);
    try {
      console.log('=== FETCHING LEAGUE MEMBERS ===');
      console.log('League ID:', leagueId);
      
      // First fetch league members
      const { data: leagueMembers, error: membersError } = await supabase
        .from('league_members')
        .select('id, user_id, joined_at')
        .eq('league_id', leagueId)
        .order('joined_at', { ascending: true });

      console.log('Fetched league members:', leagueMembers);
      console.log('Members error:', membersError);

      if (membersError) throw membersError;

      if (!leagueMembers || leagueMembers.length === 0) {
        console.log('No members found for league:', leagueId);
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

      console.log('Fetched profiles:', profiles);
      console.log('Profiles error:', profilesError);

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

      console.log('Combined members with profiles:', membersWithProfiles);
      setMembers(membersWithProfiles);

    } catch (error) {
      console.error('Error fetching league members:', error);
      toast({
        title: "Error",
        description: "Failed to load league members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [leagueId, members.length, toast]);

  // Memoized toggle handler
  const handleToggle = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState && members.length === 0) {
        fetchMembers();
      }
      return newState;
    });
  }, [fetchMembers, members.length]);

  // Memoized sorted members
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // Creator first
      if (a.user_id === creatorId && b.user_id !== creatorId) return -1;
      if (a.user_id !== creatorId && b.user_id === creatorId) return 1;
      
      // Then by join date
      return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
    });
  }, [members, creatorId]);

  // Memoized member cards
  const memberCards = useMemo(() => {
    return sortedMembers.map((member) => (
      <MemberCard
        key={member.id}
        member={member}
        isCreator={member.user_id === creatorId}
      />
    ));
  }, [sortedMembers, creatorId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            League Members
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
          >
            {isOpen ? 'Hide' : 'Show'} Members ({memberCount})
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: Math.min(memberCount, 5) }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {memberCards}
              {sortedMembers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No members found
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
});

LeagueMembersList.displayName = 'LeagueMembersList';
