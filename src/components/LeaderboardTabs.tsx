
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueRankingsList } from '@/components/LeagueRankingsList';
import { LeaderboardSection } from '@/components/LeaderboardSection';
import { MyLeaguesTab } from '@/components/MyLeaguesTab';

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
}

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  leaguesWithRanks,
  isLoading,
  expandedLeagues,
  onToggleExpansion,
}) => {
  return (
    <Tabs defaultValue="my-leagues" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-4">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="my-leagues" className="text-xs sm:text-sm">
            My Leagues
          </TabsTrigger>
          <TabsTrigger value="rankings" className="text-xs sm:text-sm">
            League Rankings
          </TabsTrigger>
          <TabsTrigger value="global" className="text-xs sm:text-sm">
            Global Leaderboard
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="my-leagues" className="mt-6">
        <MyLeaguesTab />
      </TabsContent>

      <TabsContent value="rankings" className="mt-6">
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
