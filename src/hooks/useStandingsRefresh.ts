
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
      
      // First, check for and clean up any duplicate global standings entries
      const { data: duplicateCheck, error: duplicateError } = await supabase
        .from('standings')
        .select('id, user_id')
        .is('league_id', null)
        .eq('user_id', user.id);

      if (duplicateError) {
        console.error('Error checking for duplicates:', duplicateError);
      } else if (duplicateCheck && duplicateCheck.length > 1) {
        console.log(`Found ${duplicateCheck.length} duplicate global standings entries for user ${user.id}`);
        
        // Keep only the first entry, delete the rest
        const idsToDelete = duplicateCheck.slice(1).map(entry => entry.id);
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('standings')
            .delete()
            .in('id', idsToDelete);
            
          if (deleteError) {
            console.error('Error deleting duplicate entries:', deleteError);
          } else {
            console.log(`Deleted ${idsToDelete.length} duplicate entries`);
          }
        }
      }
      
      // Call the database function to initialize complete standings for the current user
      const { data, error } = await supabase.rpc('initialize_user_complete_standings', {
        target_user_id: user.id
      });

      if (error) throw error;

      console.log('Standings initialization result:', data);
      
      // Force refresh all rankings using the updated function
      const { error: refreshError } = await supabase.rpc('refresh_all_rankings');
      
      if (refreshError) {
        console.error('Error during rankings refresh:', refreshError);
      } else {
        console.log('Rankings refresh completed successfully');
      }
      
      toast({
        title: "Rankings Updated",
        description: "Your standings have been refreshed with corrected rankings.",
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
