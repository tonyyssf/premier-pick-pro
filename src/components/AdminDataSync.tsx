import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminFixtureSync } from './AdminFixtureSync';
import { Database, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncStatus {
  fixturesSynced: boolean;
  currentGameweekSynced: boolean;
  scoresUpdated: boolean;
}

const AdminDataSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    fixturesSynced: false,
    currentGameweekSynced: false,
    scoresUpdated: false,
  });
  const { toast } = useToast();
  const [loadingCurrentGameweek, setLoadingCurrentGameweek] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);

  const handleSyncCurrentGameweek = async () => {
    setLoadingCurrentGameweek(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-gameweek-data', {
        body: { action: 'sync-current-gameweek' },
      });

      if (error) {
        console.error('Error syncing current gameweek:', error);
        toast({
          title: 'Error',
          description: 'Failed to sync current gameweek. Please try again.',
          variant: 'destructive',
        });
      } else {
        console.log('Sync current gameweek result:', data);
        setSyncStatus((prev) => ({ ...prev, currentGameweekSynced: true }));
        toast({
          title: 'Success',
          description: 'Current gameweek synced successfully!',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCurrentGameweek(false);
    }
  };

  const handleUpdateScores = async () => {
    setLoadingScores(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-gameweek-data', {
        body: { action: 'update-scores' },
      });

      if (error) {
        console.error('Error updating scores:', error);
        toast({
          title: 'Error',
          description: 'Failed to update scores. Please try again.',
          variant: 'destructive',
        });
      } else {
        console.log('Update scores result:', data);
        setSyncStatus((prev) => ({ ...prev, scoresUpdated: true }));
        toast({
          title: 'Success',
          description: 'Scores updated successfully!',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingScores(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Fixtures Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{syncStatus.fixturesSynced ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Gameweek Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{syncStatus.currentGameweekSynced ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scores Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{syncStatus.scoresUpdated ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fixtures" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fixtures" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Fixture Sync</span>
          </TabsTrigger>
          <TabsTrigger value="current-gameweek" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Current Gameweek</span>
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Score Updates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixtures">
          <AdminFixtureSync />
        </TabsContent>

        <TabsContent value="current-gameweek">
          <Card>
            <CardHeader>
              <CardTitle>Sync Current Gameweek Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSyncCurrentGameweek} disabled={loadingCurrentGameweek}>
                {loadingCurrentGameweek ? 'Syncing...' : 'Sync Current Gameweek'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Update Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleUpdateScores} disabled={loadingScores}>
                {loadingScores ? 'Updating...' : 'Update Scores'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDataSync;
