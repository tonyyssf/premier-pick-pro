
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGameweekManagement = (
  loadCurrentGameweek: () => Promise<void>,
  loadUserPicks: () => Promise<void>,
  loadScoresAndStandings: () => Promise<void>,
  setScoresLoading: (loading: boolean) => void,
  user: any
) => {
  const { toast } = useToast();

  const advanceToNextGameweek = async (): Promise<boolean> => {
    try {
      setScoresLoading(true);
      
      const { error } = await supabase.rpc('advance_to_next_gameweek');
      
      if (error) {
        console.error('Error advancing to next gameweek:', error);
        toast({
          title: "Error Advancing Gameweek",
          description: error.message || "Could not advance to the next gameweek.",
          variant: "destructive",
        });
        return false;
      }

      // Reload current gameweek and fixtures after advancement
      await loadCurrentGameweek();
      
      // Reload user picks for the new gameweek
      if (user) {
        await loadUserPicks();
      }
      
      toast({
        title: "Gameweek Advanced",
        description: "Successfully advanced to the next gameweek.",
      });
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while advancing the gameweek.",
        variant: "destructive",
      });
      return false;
    } finally {
      setScoresLoading(false);
    }
  };

  const calculateScores = async (gameweekId?: string) => {
    try {
      setScoresLoading(true);
      
      if (gameweekId) {
        const { error } = await supabase.rpc('calculate_gameweek_scores', {
          gameweek_uuid: gameweekId
        });
        
        if (error) {
          console.error('Error calculating scores:', error);
          toast({
            title: "Error Calculating Scores",
            description: "Could not calculate scores for this gameweek.",
            variant: "destructive",
          });
          return;
        }

        // After calculating scores, check if we can advance to the next gameweek
        const { data: isComplete, error: checkError } = await supabase.rpc('check_gameweek_completion', {
          gameweek_uuid: gameweekId
        });

        if (checkError) {
          console.error('Error checking gameweek completion:', checkError);
        } else if (isComplete) {
          // Automatically advance to next gameweek if all fixtures are finished
          console.log('All fixtures finished, attempting to advance gameweek...');
          await advanceToNextGameweek();
        }
      } else {
        const { error } = await supabase.rpc('update_all_scores');
        
        if (error) {
          console.error('Error updating all scores:', error);
          toast({
            title: "Error Updating Scores",
            description: "Could not update all scores.",
            variant: "destructive",
          });
          return;
        }
      }

      // Reload scores and standings after calculation
      await loadScoresAndStandings();
      
      toast({
        title: "Scores Updated",
        description: "All scores have been calculated and updated.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while calculating scores.",
        variant: "destructive",
      });
    } finally {
      setScoresLoading(false);
    }
  };

  return {
    advanceToNextGameweek,
    calculateScores
  };
};
