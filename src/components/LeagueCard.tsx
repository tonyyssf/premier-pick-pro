
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown } from 'lucide-react';
import { ManageLeagueDialog } from './ManageLeagueDialog';
import { LeagueMembersList } from './LeagueMembersList';

interface LeagueCardProps {
  league: {
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
  };
  onJoin?: (leagueId: string) => void;
  onLeave?: (leagueId: string) => void;
  onLeagueUpdated?: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
}

export const LeagueCard: React.FC<LeagueCardProps> = ({
  league,
  onJoin,
  onLeave,
  onLeagueUpdated,
  isJoining = false,
  isLeaving = false
}) => {
  const isAtCapacity = league.member_count && league.max_members && 
                      league.member_count >= league.max_members;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{league.name}</CardTitle>
          <div className="flex items-center space-x-2">
            {league.is_creator && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Crown className="h-3 w-3" />
                <span>Creator</span>
              </Badge>
            )}
          </div>
        </div>
        {league.description && (
          <p className="text-sm text-gray-600 mt-2">{league.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {league.member_count || 0}
              {league.max_members && ` / ${league.max_members}`} members
            </span>
            {isAtCapacity && (
              <Badge variant="outline" className="text-xs">Full</Badge>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Code: <span className="font-mono font-semibold">{league.invite_code}</span>
          </div>
        </div>
        
        {/* Show members list only if user is a member or creator */}
        {(league.is_member || league.is_creator) && (
          <div className="mb-4">
            <LeagueMembersList 
              leagueId={league.id}
              creatorId={league.creator_id}
              memberCount={league.member_count || 0}
            />
          </div>
        )}
        
        <div className="flex space-x-2">
          {!league.is_member && !league.is_creator && onJoin && (
            <Button 
              onClick={() => onJoin(league.id)} 
              disabled={isJoining || isAtCapacity}
              className="flex-1"
              size="sm"
            >
              {isJoining ? 'Joining...' : isAtCapacity ? 'League Full' : 'Join League'}
            </Button>
          )}
          
          {league.is_member && !league.is_creator && onLeave && (
            <Button 
              onClick={() => onLeave(league.id)} 
              disabled={isLeaving}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              {isLeaving ? 'Leaving...' : 'Leave League'}
            </Button>
          )}
          
          {league.is_creator && onLeagueUpdated && (
            <ManageLeagueDialog league={league} onLeagueUpdated={onLeagueUpdated}>
              <Button variant="outline" className="flex-1" size="sm">
                Manage League
              </Button>
            </ManageLeagueDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
