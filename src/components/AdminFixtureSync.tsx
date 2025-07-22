
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncResult {
  success: boolean;
  message: string;
  updated: number;
  earliestKickoff?: string;
  error?: string;
}

export const AdminFixtureSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [gameweekNumber, setGameweekNumber] = useState(1);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const syncFixtures = async () => {
    if (!gameweekNumber || gameweekNumber < 1 || gameweekNumber > 38) {
      toast({
        title: "Invalid Gameweek",
        description: "Please enter a gameweek number between 1 and 38.",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    setLastSyncResult(null);

    try {
      console.log(`Starting fixture sync for gameweek ${gameweekNumber}`);
      
      const { data, error } = await supabase.functions.invoke('sync-gameweek-fixtures', {
        body: { gameweekNumber }
      });

      if (error) {
        console.error('Error calling sync function:', error);
        throw new Error(error.message || 'Failed to sync fixtures');
      }

      console.log('Sync result:', data);
      setLastSyncResult(data);

      if (data.success) {
        toast({
          title: "Fixtures Synced Successfully",
          description: `Updated ${data.updated} fixtures for Gameweek ${gameweekNumber}.`,
        });
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      
      const errorResult: SyncResult = {
        success: false,
        message: 'Sync failed',
        updated: 0,
        error: error.message || 'Unknown error occurred'
      };
      
      setLastSyncResult(errorResult);
      
      toast({
        title: "Sync Failed",
        description: error.message || "Could not sync fixtures. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Fixture Data Sync</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="gameweek">Gameweek Number</Label>
            <Input
              id="gameweek"
              type="number"
              min="1"
              max="38"
              value={gameweekNumber}
              onChange={(e) => setGameweekNumber(parseInt(e.target.value) || 1)}
              placeholder="Enter gameweek number (1-38)"
              className="mt-1"
            />
          </div>

          <Button 
            onClick={syncFixtures} 
            disabled={syncing}
            className="w-full"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing Fixtures...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Sync Gameweek {gameweekNumber} Fixtures
              </>
            )}
          </Button>
        </div>

        {lastSyncResult && (
          <div className={`p-4 rounded-lg border ${
            lastSyncResult.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-start space-x-2">
              {lastSyncResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  lastSyncResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastSyncResult.message}
                </p>
                
                {lastSyncResult.success && (
                  <div className="mt-2 space-y-1 text-sm text-green-700">
                    <p>• Updated {lastSyncResult.updated} fixtures</p>
                    {lastSyncResult.earliestKickoff && (
                      <p>• Deadline updated to: {new Date(lastSyncResult.earliestKickoff).toLocaleString()}</p>
                    )}
                  </div>
                )}
                
                {lastSyncResult.error && (
                  <p className="mt-2 text-sm text-red-700">
                    Error: {lastSyncResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Fetches accurate fixture times from Rapid API</li>
            <li>• Updates existing fixtures with correct dates and times</li>
            <li>• Automatically sorts fixtures chronologically</li>
            <li>• Updates gameweek deadline to match earliest fixture</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
