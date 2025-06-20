
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pick } from '@/types/picks';

export const usePicksData = (user: any) => {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserPicks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_picks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading picks:', error);
        toast({
          title: "Error Loading Picks",
          description: "Could not load your previous picks.",
          variant: "destructive",
        });
      } else {
        const formattedPicks: Pick[] = data.map(pick => ({
          id: pick.id,
          gameweekId: pick.gameweek_id,
          fixtureId: pick.fixture_id,
          pickedTeamId: pick.picked_team_id,
          timestamp: new Date(pick.created_at),
        }));
        setPicks(formattedPicks);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserPicks();
    } else {
      setPicks([]);
      setLoading(false);
    }
  }, [user]);

  return {
    picks,
    loading,
    setPicks,
    loadUserPicks
  };
};
