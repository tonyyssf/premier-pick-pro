
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { LeagueLeaderboard } from '@/components/LeagueLeaderboard';

interface LeagueWithRank {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

interface LeagueRankingCardProps {
  league: LeagueWithRank;
  isExpanded: boolean;
  onToggleExpansion: (leagueId: string) => void;
}

export const LeagueRankingCard: React.FC<LeagueRankingCardProps> = ({
  league,
  isExpanded,
  onToggleExpansion,
}) => {
  const getRankDisplay = (rank: number | null) => {
    if (!rank) return <span className="text-lg font-bold text-gray-400">-</span>;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  return (
    <Collapsible open={isExpanded}>
      <Card className="hover:shadow-lg transition-shadow">
        <CollapsibleTrigger 
          className="w-full"
          onClick={() => onToggleExpansion(league.id)}
        >
          <CardHeader className="bg-plpe-gradient text-white">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <CardTitle className="text-lg flex items-center gap-2">
                  {league.name}
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </CardTitle>
                {league.description && (
                  <p className="text-sm text-white/80 mt-1">{league.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-white/80">Your Rank</p>
                  <div className="flex items-center justify-end gap-2">
                    {getRankDisplay(league.user_rank)}
                    {league.user_rank && (
                      <span className="text-sm text-white/70">
                        of {league.member_count}
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Members</p>
              <p className="text-lg font-semibold text-gray-900">
                {league.member_count}
              </p>
            </div>
            {!league.user_rank && (
              <div className="flex-1 ml-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No ranking yet - start making picks to see your position!
                  </p>
                </div>
              </div>
            )}
          </div>

          <CollapsibleContent className="mt-6">
            <LeagueLeaderboard 
              leagueId={league.id} 
              leagueName={league.name}
            />
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};
