
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueRankingsList } from '@/components/LeagueRankingsList';
import { LeaderboardSection } from '@/components/LeaderboardSection';

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
    <Tabs defaultValue="leagues" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="leagues">My League Rankings</TabsTrigger>
        <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
      </TabsList>

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
