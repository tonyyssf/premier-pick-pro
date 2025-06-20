
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, Database, Users } from 'lucide-react';

export const AdminDataSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncingTeams, setSyncingTeams] = useState(false);
  const [syncingFixtures, setSyncingFixtures] = useState(false);
  const { toast } = useToast();

  const syncData = async (action: 'sync-teams' | 'sync-fixtures' | 'sync-all') => {
    const setSyncState = action === 'sync-teams' ? setSyncingTeams : 
                        action === 'sync-fixtures' ? setSyncingFixtures : setSyncing;
    
    setSyncState(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-epl-data', {
        body: { action }
      });

      if (error) throw error;

      toast({
        title: "Sync Successful",
        description: data.message,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || 'An error occurred during sync',
        variant: "destructive",
      });
    } finally {
      setSyncState(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Synchronization</h2>
        <p className="text-gray-600">
          Sync your application with the latest English Premier League data from RapidAPI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Teams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sync all Premier League teams, including names, logos, and team codes.
            </p>
            <Button
              onClick={() => syncData('sync-teams')}
              disabled={syncingTeams}
              className="w-full"
              variant="outline"
            >
              {syncingTeams ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Sync Teams
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <span>Fixtures</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Sync gameweeks, fixtures, scores, and match schedules.
            </p>
            <Button
              onClick={() => syncData('sync-fixtures')}
              disabled={syncingFixtures}
              className="w-full"
              variant="outline"
            >
              {syncingFixtures ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Sync Fixtures
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <span>Everything</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Perform a complete sync of all teams, gameweeks, and fixtures.
            </p>
            <Button
              onClick={() => syncData('sync-all')}
              disabled={syncing}
              className="w-full bg-plpe-purple hover:bg-purple-700"
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing All...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Important Notes</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Always sync teams before syncing fixtures</li>
                <li>• Data sync may take a few minutes to complete</li>
                <li>• Existing data will be updated with new information</li>
                <li>• Use "Sync All Data" for the initial setup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
