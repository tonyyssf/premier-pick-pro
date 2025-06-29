
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LeagueMembersTab } from './LeagueMembersTab';
import type { League, LeagueMember } from '@/types/league';

interface LeagueAccessDeniedProps {
  league: League;
  members: LeagueMember[];
  loadingMembers: boolean;
  className?: string;
}

export const LeagueAccessDenied: React.FC<LeagueAccessDeniedProps> = ({
  league,
  members,
  loadingMembers,
  className
}) => {
  return (
    <div className={className}>
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Only the league creator can manage league settings. You can only view the member list.
        </AlertDescription>
      </Alert>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">League Members ({members.length})</h3>
        <LeagueMembersTab
          league={league}
          members={members}
          loadingMembers={loadingMembers}
          removingMember={null}
          onRemoveMember={() => {}} // No action for non-creators
        />
      </div>
    </div>
  );
};
