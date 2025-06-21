
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserStanding {
  id: string;
  userId: string;
  totalPoints: number;
  correctPicks: number;
  totalPicks: number;
  currentRank: number | null;
}

interface LeagueStanding {
  id: string;
  user_id: string;
  total_points: number;
  correct_picks: number;
  total_picks: number;
  current_rank: number | null;
  league_id: string;
}

export const useRealtimeStandings = () => {
  const [userStandings, setUserStandings] = useState<UserStanding[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<{ [leagueId: string]: LeagueStanding[] }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGlobalStandings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_standings')
        .select('*')
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const formattedStandings: UserStanding[] = data.map(standing => ({
        id: standing.id,
        userId: standing.user_id,
        totalPoints: standing.total_points,
        correctPicks: standing.correct_picks,
        totalPicks: standing.total_picks,
        currentRank: standing.current_rank,
      }));

      setUserStandings(formattedStandings);
    } catch (error: any) {
      console.error('Error loading global standings:', error);
      toast({
        title: "Error Loading Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadLeagueStandings = async (leagueId: string) => {
    try {
      const { data, error } = await supabase
        .from('league_standings')
        .select('*')
        .eq('league_id', leagueId)
        .order('current_rank', { ascending: true, nullsFirst: false });

      if (error) throw error;

      setLeagueStandings(prev => ({
        ...prev,
        [leagueId]: data || []
      }));
    } catch (error: any) {
      console.error('Error loading league standings:', error);
      toast({
        title: "Error Loading League Standings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initial load
    const loadData = async () => {
      setLoading(true);
      await loadGlobalStandings();
      setLoading(false);
    };

    loadData();

    // Set up realtime subscription for global standings
    const globalChannel = supabase
      .channel('global-standings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_standings'
        },
        (payload) => {
          console.log('Global standings update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newStanding: UserStanding = {
              id: payload.new.id,
              userId: payload.new.user_id,
              totalPoints: payload.new.total_points,
              correctPicks: payload.new.correct_picks,
              totalPicks: payload.new.total_picks,
              currentRank: payload.new.current_rank,
            };

            setUserStandings(prev => {
              const existing = prev.find(s => s.id === newStanding.id);
              if (existing) {
                return prev.map(s => s.id === newStanding.id ? newStanding : s);
              } else {
                return [...prev, newStanding].sort((a, b) => (a.currentRank || 999) - (b.currentRank || 999));
              }
            });

            // Show toast for current user's rank changes
            if (payload.new.user_id === user.id && payload.eventType === 'UPDATE') {
              toast({
                title: "Your Rank Updated!",
                description: `You're now ranked #${payload.new.current_rank} with ${payload.new.total_points} points`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setUserStandings(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for league standings
    const leagueChannel = supabase
      .channel('league-standings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'league_standings'
        },
        (payload) => {
          console.log('League standings update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const leagueId = payload.new.league_id;
            
            setLeagueStandings(prev => {
              const currentLeagueStandings = prev[leagueId] || [];
              const existing = currentLeagueStandings.find(s => s.id === payload.new.id);
              
              let updatedStandings;
              if (existing) {
                updatedStandings = currentLeagueStandings.map(s => s.id === payload.new.id ? payload.new : s);
              } else {
                updatedStandings = [...currentLeagueStandings, payload.new];
              }
              
              return {
                ...prev,
                [leagueId]: updatedStandings.sort((a, b) => (a.current_rank || 999) - (b.current_rank || 999))
              };
            });
          } else if (payload.eventType === 'DELETE') {
            const leagueId = payload.old.league_id;
            setLeagueStandings(prev => ({
              ...prev,
              [leagueId]: (prev[leagueId] || []).filter(s => s.id !== payload.old.id)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(leagueChannel);
    };
  }, [user]);

  return {
    userStandings,
    leagueStandings,
    loading,
    loadLeagueStandings,
    loadGlobalStandings
  };
};
