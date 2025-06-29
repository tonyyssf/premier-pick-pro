
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LeagueStats } from '@/types/analytics';

export const useLeagueAnalytics = () => {
  return useQuery({
    queryKey: ['league-analytics'],
    queryFn: async (): Promise<LeagueStats> => {
      // Get basic league stats
      const { data: leagues, error: leaguesError } = await supabase
        .from('leagues')
        .select('id, created_at, max_members');
      
      if (leaguesError) throw leaguesError;

      // Get league member counts and unique users
      const { data: memberCounts, error: membersError } = await supabase
        .from('league_members')
        .select('league_id, user_id');
      
      if (membersError) throw membersError;

      const memberCountsByLeague = memberCounts.reduce((acc, member) => {
        acc[member.league_id] = (acc[member.league_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalLeagues = leagues.length;
      // Since we removed public/private leagues, all leagues are now private by default
      const publicLeagues = 0;
      const privateLeagues = totalLeagues;
      const totalMembers = memberCounts.length; // Total memberships (can include duplicates across leagues)
      
      // Count unique users across all leagues
      const uniqueUserIds = new Set(memberCounts.map(m => m.user_id));
      const uniqueUsers = uniqueUserIds.size;
      
      const averageMembersPerLeague = totalLeagues > 0 ? Math.round(totalMembers / totalLeagues * 10) / 10 : 0;

      // Calculate leagues by size
      const leaguesBySize = [
        { size: '1-5 members', count: 0 },
        { size: '6-15 members', count: 0 },
        { size: '16-20 members', count: 0 },
        { size: '20 members', count: 0 }, // Updated to reflect 20 max
      ];

      Object.values(memberCountsByLeague).forEach(count => {
        if (count <= 5) leaguesBySize[0].count++;
        else if (count <= 15) leaguesBySize[1].count++;
        else if (count < 20) leaguesBySize[2].count++;
        else leaguesBySize[3].count++; // Exactly 20 members
      });

      // Calculate creation trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const leagueCreationTrend = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: leagues.filter(l => l.created_at.startsWith(date)).length,
      }));

      return {
        totalLeagues,
        publicLeagues,
        privateLeagues,
        totalMembers,
        uniqueUsers,
        averageMembersPerLeague,
        leaguesBySize,
        leagueCreationTrend,
      };
    },
    refetchInterval: 30000,
  });
};
