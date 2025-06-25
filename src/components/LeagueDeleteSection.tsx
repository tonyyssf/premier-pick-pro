
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface League {
  id: string;
  name: string;
  creator_id: string;
}

interface LeagueDeleteSectionProps {
  league: League;
  onLeagueUpdated: () => void;
}

export const LeagueDeleteSection: React.FC<LeagueDeleteSectionProps> = ({
  league,
  onLeagueUpdated
}) => {
  const [isDeletingLeague, setIsDeletingLeague] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDeleteLeague = async () => {
    setIsDeletingLeague(true);
    try {
      // First, delete all league members
      const { error: membersError } = await supabase
        .from('league_members')
        .delete()
        .eq('league_id', league.id);

      if (membersError) throw membersError;

      // Then, delete league standings from the unified standings table
      const { error: standingsError } = await supabase
        .from('standings')
        .delete()
        .eq('league_id', league.id);

      if (standingsError) throw standingsError;

      // Finally, delete the league itself
      const { error: leagueError } = await supabase
        .from('leagues')
        .delete()
        .eq('id', league.id)
        .eq('creator_id', user?.id);

      if (leagueError) throw leagueError;

      toast({
        title: "League Deleted",
        description: "The league has been permanently deleted.",
      });

      onLeagueUpdated();
    } catch (error: any) {
      toast({
        title: "Error Deleting League",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingLeague(false);
    }
  };

  return (
    <div className="border-t pt-6 mt-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-800 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          Once you delete a league, there is no going back. This action will permanently delete the league and all associated data.
        </p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="flex items-center space-x-2"
              disabled={isDeletingLeague}
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeletingLeague ? 'Deleting...' : 'Delete League'}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this league?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the league "{league.name}" 
                and remove all members, standings, and associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteLeague}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, delete league
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
