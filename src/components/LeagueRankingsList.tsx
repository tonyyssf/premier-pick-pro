
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users, AlertCircle } from 'lucide-react';
import { LeagueLeaderboard } from './LeagueLeaderboard';
import { RankIcon } from './RankIcon';
import { CreateLeagueDialog } from './CreateLeagueDialog';
import { JoinLeagueDialog } from './JoinLeagueDialog';

interface LeagueWithRank {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

interface LeagueRankingsListProps {
  leaguesWithRanks: LeagueWithRank[];
  isLoading: boolean;
  expandedLeagues: Set<string>;
  onToggleExpansion: (leagueId: string) => void;
  onLeagueCreated?: () => void;
  onLeagueJoined?: () => void;
}

export const LeagueRankingsList: React.FC<LeagueRankingsListProps> = ({
  leaguesWithRanks,
  isLoading,
  expandedLeagues,
  onToggleExpansion,
  onLeagueCreated,
  onLeagueJoined,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
        <span className="ml-3 text-gray-600">Loading your league rankings...</span>
      </div>
    );
  }

  if (leaguesWithRanks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No Leagues Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your own league or join an existing one to compete with friends!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CreateLeagueDialog onLeagueCreated={onLeagueCreated} />
            <JoinLeagueDialog onLeagueJoined={onLeagueJoined} />
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>• Create a league to invite friends and family</p>
            <p>• Join with an invite code to compete together</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaguesWithRanks.map((league) => {
        const isExpanded = expandedLeagues.has(league.id);
        const hasRankingIssue = league.user_rank === null;
        
        return (
          <Card key={league.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{league.name}</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {league.member_count || 0} members
                  </Badge>
                  {hasRankingIssue && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      No ranking
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Your Rank</div>
                    <div className="font-semibold">
                      {hasRankingIssue ? (
                        <span className="text-yellow-600 text-sm">
                          No ranking yet - start making picks to see your position!
                        </span>
                      ) : (
                        <RankIcon rank={league.user_rank} />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpansion(league.id)}
                    className="ml-2"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {league.description && (
                <p className="text-sm text-gray-600 mt-2">{league.description}</p>
              )}
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <LeagueLeaderboard 
                  leagueId={league.id} 
                  leagueName={league.name}
                />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
