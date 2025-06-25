
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueRankingsList } from '@/components/LeagueRankingsList';
import { LeaderboardSection } from '@/components/LeaderboardSection';
import { RefreshStandingsButton } from '@/components/RefreshStandingsButton';

interface LeagueWithRank {
  id: string;
  name: string;
  description: string | null;
  member_count?: number;
  user_rank: number | null;
}

interface LeaderboardTabsProps {
  leaguesWithRanks: LeagueWithRank[];
  isLoading: boolean;
  expandedLeagues: Set<string>;
  onToggleExpansion: (leagueId: string) => void;
  onRefreshNeeded?: () => void;
}

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  leaguesWithRanks,
  isLoading,
  expandedLeagues,
  onToggleExpansion,
  onRefreshNeeded,
}) => {
  return (
    <Tabs defaultValue="leagues" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="leagues">My League Rankings</TabsTrigger>
          <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
        </TabsList>
        
        <RefreshStandingsButton onRefreshComplete={onRefreshNeeded} />
      </div>

      <TabsContent value="leagues" className="mt-6">
        <LeagueRankingsList
          leaguesWithRanks={leaguesWithRanks}
          isLoading={isLoading}
          expandedLeagues={expandedLeagues}
          onToggleExpansion={onToggleExpansion}
        />
      </TabsContent>

      <TabsContent value="global" className="mt-6">
        <LeaderboardSection />
      </TabsContent>
    </Tabs>
  );
};
