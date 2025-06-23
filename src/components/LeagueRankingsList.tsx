
import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LeagueRankingCard } from '@/components/LeagueRankingCard';
import { AdBanner } from '@/components/AdBanner';

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
}

export const LeagueRankingsList: React.FC<LeagueRankingsListProps> = ({
  leaguesWithRanks,
  isLoading,
  expandedLeagues,
  onToggleExpansion,
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading your league rankings..." />;
  }

  if (leaguesWithRanks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">You're not a member of any leagues yet.</p>
        <p className="text-sm text-gray-500">Create or join a league to see your rankings!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leaguesWithRanks.map((league, index) => (
        <div key={league.id}>
          <LeagueRankingCard
            league={league}
            isExpanded={expandedLeagues.has(league.id)}
            onToggleExpansion={onToggleExpansion}
          />
          
          {/* Insert ad after every 2 leagues */}
          {(index + 1) % 2 === 0 && index < leaguesWithRanks.length - 1 && (
            <div className="my-8">
              <AdBanner position="top" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
