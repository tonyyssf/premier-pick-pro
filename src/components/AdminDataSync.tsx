
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { usePicks } from '@/contexts/PicksContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, Database, Calendar, ArrowRight } from 'lucide-react';

export const AdminDataSync: React.FC = () => {
  const [syncingCurrentGameweek, setSyncingCurrentGameweek] = useState(false);
  const [syncingScores, setSyncingScores] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { advanceToNextGameweek, calculateScores, currentGameweek, scoresLoading } = usePicks();

  const syncGameweekData = async (action: 'sync-current-gameweek' | 'update-scores') => {
    const setSyncState = action === 'sync-current-gameweek' ? setSyncingCurrentGameweek : setSyncingScores;
    
    setSyncState(true);
    
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to perform this action');
      }

      const { data, error } = await supabase.functions.invoke('sync-gameweek-data', {
        body: { action },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['admin-gameweeks'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-fixtures'] });
      await queryClient.invalidateQueries({ queryKey: ['gameweek-scores'] });

      toast({
        title: "Sync Successful",
        description: data.message,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      
      let errorMessage = error.message || 'An error occurred during sync';
      
      // Handle specific error cases
      if (error.message?.includes('Insufficient privileges')) {
        errorMessage = 'You do not have admin privileges to perform this action';
      } else if (error.message?.includes('authentication')) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSyncState(false);
    }
  };

  const handleCalculateCurrentGameweekScores = async () => {
    if (currentGameweek) {
      await calculateScores(currentGameweek.id);
    }
  };

  const handleAdvanceGameweek = async () => {
    await advanceToNextGameweek();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gameweek Data Management</h2>
        <p className="text-gray-600">
          Manage current gameweek fixtures, update match results, and control gameweek progression.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Current Gameweek</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sync the current gameweek fixtures and update kickoff times from the API.
            </p>
            <Button
              onClick={() => syncGameweekData('sync-current-gameweek')}
              disabled={syncingCurrentGameweek}
              className="w-full"
              variant="outline"
            >
              {syncingCurrentGameweek ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Sync Current Gameweek
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <span>Match Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Update scores and match status for completed fixtures.
            </p>
            <Button
              onClick={() => syncGameweekData('update-scores')}
              disabled={syncingScores}
              className="w-full"
              variant="outline"
            >
              {syncingScores ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Scores
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-purple-500" />
              <span>Gameweek Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Calculate scores for gameweek {currentGameweek?.number || 'N/A'}
                </p>
                <Button
                  onClick={handleCalculateCurrentGameweekScores}
                  disabled={scoresLoading || !currentGameweek}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  {scoresLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-3 w-3" />
                      Calculate Scores
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Manually advance to next gameweek
                </p>
                <Button
                  onClick={handleAdvanceGameweek}
                  disabled={scoresLoading}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  {scoresLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Advancing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-3 w-3" />
                      Advance Gameweek
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Gameweek Progression</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Calculate scores to automatically check if all fixtures are finished</li>
                <li>• System will auto-advance when all gameweek fixtures are completed</li>
                <li>• Manual advance is available for testing or special circumstances</li>
                <li>• Current gameweek: {currentGameweek?.number || 'Loading...'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
