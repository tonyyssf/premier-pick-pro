
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trash2, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

interface League {
  id: string;
  creator_id: string;
}

interface LeagueMembersTabProps {
  league: League;
  members: LeagueMember[];
  loadingMembers: boolean;
  removingMember: string | null;
  onRemoveMember: (memberId: string, memberUserId: string) => void;
}

export const LeagueMembersTab: React.FC<LeagueMembersTabProps> = ({
  league,
  members,
  loadingMembers,
  removingMember,
  onRemoveMember
}) => {
  const { user } = useAuth();
  const isCreator = user?.id === league.creator_id;

  if (loadingMembers) {
    return (
      <div className="text-center py-8">
        <p>Loading members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No members found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">
                {member.profiles?.name || member.profiles?.username || 'Unknown User'}
                {member.user_id === league.creator_id && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Creator
                  </Badge>
                )}
              </p>
              <p className="text-sm text-gray-500">
                {member.profiles?.email}
              </p>
              <p className="text-xs text-gray-400">
                Joined: {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {isCreator && member.user_id !== league.creator_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemoveMember(member.id, member.user_id)}
              disabled={removingMember === member.id}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              {removingMember === member.id ? 'Removing...' : 'Remove'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
