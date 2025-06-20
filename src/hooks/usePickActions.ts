
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pick, Fixture, Gameweek } from '@/types/picks';

export const usePickActions = (
  user: any,
  currentGameweek: Gameweek | null,
  picks: Pick[],
  fixtures: Fixture[],
  setPicks: (picks: Pick[]) => void,
  getTeamUsedCount: (teamId: string) => number,
  hasPickForGameweek: (gameweekId: string) => boolean
) => {
  const { toast } = useToast();

  const submitPick = async (fixtureId: string, teamId: string): Promise<boolean> => {
    if (!user || !currentGameweek) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make picks.",
        variant: "destructive",
      });
      return false;
    }

    // Check if already has pick for current gameweek
    if (hasPickForGameweek(currentGameweek.id)) {
      toast({
        title: "Pick Already Made",
        description: "You've already made a pick for this gameweek.",
        variant: "destructive",
      });
      return false;
    }

    // Check if team has been used too many times
    if (getTeamUsedCount(teamId) >= 2) {
      const fixture = fixtures.find(f => f.id === fixtureId);
      const team = fixture?.homeTeam.id === teamId ? fixture.homeTeam : fixture?.awayTeam;
      
      toast({
        title: "Team Used Too Many Times",
        description: `You've already used ${team?.name} 2 times this season.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_picks')
        .insert({
          user_id: user.id,
          gameweek_id: currentGameweek.id,
          fixture_id: fixtureId,
          picked_team_id: teamId,
        });

      if (error) {
        console.error('Error submitting pick:', error);
        toast({
          title: "Error Submitting Pick",
          description: "Could not save your pick. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      const newPick: Pick = {
        id: crypto.randomUUID(),
        gameweekId: currentGameweek.id,
        fixtureId,
        pickedTeamId: teamId,
        timestamp: new Date(),
      };

      setPicks([...picks, newPick]);
      
      const fixture = fixtures.find(f => f.id === fixtureId);
      const team = fixture?.homeTeam.id === teamId ? fixture.homeTeam : fixture?.awayTeam;
      const opponent = fixture?.homeTeam.id === teamId ? fixture.awayTeam : fixture?.homeTeam;
      
      toast({
        title: "Pick Submitted!",
        description: `You've picked ${team?.name} to win their match against ${opponent?.name}.`,
      });

      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const canUndoPick = (): boolean => {
    if (!currentGameweek || !hasPickForGameweek(currentGameweek.id)) {
      return false;
    }

    // Check if any fixture in the current gameweek has started
    const now = new Date();
    const hasStartedFixture = fixtures.some(fixture => 
      fixture.kickoffTime <= now
    );

    return !hasStartedFixture;
  };

  const undoPick = async (): Promise<boolean> => {
    if (!user || !currentGameweek) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to undo picks.",
        variant: "destructive",
      });
      return false;
    }

    if (!canUndoPick()) {
      toast({
        title: "Cannot Undo Pick",
        description: "You can only undo your pick before the first match starts.",
        variant: "destructive",
      });
      return false;
    }

    const currentPick = getCurrentPick();
    if (!currentPick) {
      toast({
        title: "No Pick to Undo",
        description: "You haven't made a pick for this gameweek yet.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_picks')
        .delete()
        .eq('user_id', user.id)
        .eq('gameweek_id', currentGameweek.id);

      if (error) {
        console.error('Error undoing pick:', error);
        toast({
          title: "Error Undoing Pick",
          description: "Could not undo your pick. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Remove the pick from local state
      setPicks(picks.filter(pick => pick.gameweekId !== currentGameweek.id));
      
      toast({
        title: "Pick Undone",
        description: "Your pick has been removed. You can now make a new selection.",
      });

      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getCurrentPick = (): Pick | null => {
    if (!currentGameweek) return null;
    return picks.find(pick => pick.gameweekId === currentGameweek.id) || null;
  };

  return {
    submitPick,
    undoPick,
    canUndoPick,
    getCurrentPick
  };
};
