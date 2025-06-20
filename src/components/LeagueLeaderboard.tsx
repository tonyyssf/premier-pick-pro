
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LeagueStanding {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
}

interface GlobalStanding {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
}

interface LeagueLeaderboardProps {
  leagueId: string;
  leagueName: string;
}

export const LeagueLeaderboard: React.FC<LeagueLeaderboardProps> = ({ 
  leagueId, 
  leagueName 
}) => {
  const [leagueStandings, setLeagueStandings] = useState<LeagueStanding[]>([]);
  const [globalStandings, setGlobalStandings] = useState<GlobalStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadLeagueStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('league_standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('current_rank', { ascending: true, nullsLast: true });

      if (error) throw error;
      setLeagueStandings(data || []);
    } catch (error: any) {
      console.error('Error loading league standings:', error);
      toast({
        title: "Error Loading League Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadGlobalStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_standings')
        .select('*')
        .order('current_rank', { ascending: true, nullsLast: true })
        .limit(50);

      if (error) throw error;
      setGlobalStandings(data || []);
    } catch (error: any) {
      console.error('Error loading global standings:', error);
      toast({
        title: "Error Loading Global Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadLeagueStandings(), loadGlobalStandings()]);
      setLoading(false);
    };

    loadData();
  }, [leagueId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  const renderStandingsTable = (standings: (LeagueStanding | GlobalStanding)[], isLeague: boolean) => {
    if (standings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No standings available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Standings will appear once members make picks and gameweeks are completed.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center">Correct</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Win Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((standing, index) => {
              const rank = standing.current_rank || index + 1;
              const isCurrentUser = user && standing.user_id === user.id;
              const winRate = standing.total_picks > 0 
                ? ((standing.correct_picks / standing.total_picks) * 100).toFixed(1)
                : '0.0';

              return (
                <TableRow
                  key={standing.id}
                  className={isCurrentUser ? 'bg-purple-50 border-l-4 border-plpe-purple' : ''}
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900">
                      {isCurrentUser ? 'You' : `Player ${standing.user_id.slice(0, 8)}`}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-lg font-bold text-plpe-purple">
                      {standing.total_points}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold">
                      {standing.correct_picks}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold">
                      {standing.total_picks}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-semibold text-gray-600">
                      {winRate}%
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-plpe-gradient px-6 py-4">
        <h3 className="text-xl font-semibold text-white">{leagueName} Leaderboard</h3>
      </div>
      
      <div className="p-6">
        <Tabs defaultValue="league" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="league" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              League ({leagueStandings.length})
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Global (Top 50)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="league" className="mt-6">
            {renderStandingsTable(leagueStandings, true)}
          </TabsContent>
          
          <TabsContent value="global" className="mt-6">
            {renderStandingsTable(globalStandings, false)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
