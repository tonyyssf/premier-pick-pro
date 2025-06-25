
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useStandingsRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const refreshUserStandings = async () => {
    if (!user) return;

    setIsRefreshing(true);
    try {
      console.log('Initializing complete standings for user:', user.id);
      
      // Call the database function to initialize complete standings for the current user
      const { data, error } = await supabase.rpc('initialize_user_complete_standings', {
        target_user_id: user.id
      });

      if (error) throw error;

      console.log('Standings initialization result:', data);
      
      toast({
        title: "Rankings Updated",
        description: "Your standings have been refreshed successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error refreshing user standings:', error);
      toast({
        title: "Error Refreshing Rankings",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshUserStandings,
    isRefreshing
  };
};
