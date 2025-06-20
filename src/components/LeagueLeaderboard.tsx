
import React, { useState, useEffect } from 'react';
import { Users, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StandingsTable } from './StandingsTable';
import { LoadingSpinner } from './LoadingSpinner';
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
  const [userLeagueRank, setUserLeagueRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadLeagueStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('league_standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setLeagueStandings(data || []);

      // Find current user's rank in this league
      const userStanding = data?.find(standing => standing.user_id === user?.id);
      setUserLeagueRank(userStanding?.current_rank || null);
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
        .order('current_rank', { ascending: true, nullsFirst: false })
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

  if (loading) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-plpe-gradient px-6 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">{leagueName} Leaderboard</h3>
          {userLeagueRank && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white text-sm font-medium">
                Your Rank: #{userLeagueRank}
              </span>
            </div>
          )}
        </div>
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
            <StandingsTable 
              standings={leagueStandings} 
              currentUserId={user?.id} 
            />
          </TabsContent>
          
          <TabsContent value="global" className="mt-6">
            <StandingsTable 
              standings={globalStandings} 
              currentUserId={user?.id} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
