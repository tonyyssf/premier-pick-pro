
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';
import { LeagueRankingsList } from '@/components/LeagueRankingsList';
import { LeaderboardSection } from '@/components/LeaderboardSection';
import { RefreshStandingsButton } from '@/components/RefreshStandingsButton';
import { CreateLeagueDialog } from '@/components/CreateLeagueDialog';
import { JoinLeagueDialog } from '@/components/JoinLeagueDialog';

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
  onLeagueCreated?: () => void;
  onLeagueJoined?: () => void;
}

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  leaguesWithRanks,
  isLoading,
  expandedLeagues,
  onToggleExpansion,
  onRefreshNeeded,
  onLeagueCreated,
  onLeagueJoined,
}) => {
  return (
    <Tabs defaultValue="leagues" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="leagues" className="text-xs sm:text-sm">
            My League Rankings
          </TabsTrigger>
          <TabsTrigger value="global" className="text-xs sm:text-sm">
            Global Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          {leaguesWithRanks.length > 0 && (
            <>
              <CreateLeagueDialog onLeagueCreated={onLeagueCreated} />
              <JoinLeagueDialog onLeagueJoined={onLeagueJoined} />
            </>
          )}
          <RefreshStandingsButton onRefreshComplete={onRefreshNeeded} />
        </div>
      </div>

      <TabsContent value="leagues" className="mt-6">
        <LeagueRankingsList
          leaguesWithRanks={leaguesWithRanks}
          isLoading={isLoading}
          expandedLeagues={expandedLeagues}
          onToggleExpansion={onToggleExpansion}
          onLeagueCreated={onLeagueCreated}
          onLeagueJoined={onLeagueJoined}
        />
      </TabsContent>

      <TabsContent value="global" className="mt-6">
        <LeaderboardSection />
      </TabsContent>
    </Tabs>
  );
};
