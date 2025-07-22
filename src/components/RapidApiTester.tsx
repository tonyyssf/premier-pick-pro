
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TestTube, Database, Calendar, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  message: string;
  dataStructure?: any;
  totalFixtures?: number;
  totalTeams?: number;
  sampleFixtures?: any[];
  sampleTeams?: any[];
  currentData?: any;
  schedule?: any;
  teams?: any;
  comparison?: any;
  error?: string;
}

export const RapidApiTester: React.FC = () => {
  const { isAdmin, checkSyncRateLimit } = useAdmin();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [activeTest, setActiveTest] = useState<string>('');

  const handleTest = async (action: string, testName: string) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    const rateLimit = checkSyncRateLimit();
    if (!rateLimit.allowed) {
      toast.error(`Rate limit exceeded. Please wait ${Math.ceil(rateLimit.timeUntilReset / 1000)} seconds.`);
      return;
    }

    setTesting(true);
    setActiveTest(testName);
    setResults(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await supabase.functions.invoke('test-rapid-api', {
        body: { action },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to test API');
      }

      setResults(response.data);
      toast.success(`${testName} completed successfully`);
    } catch (error: any) {
      console.error(`Error testing ${testName}:`, error);
      setResults({
        success: false,
        message: error.message || `Failed to test ${testName}`,
        error: error.toString()
      });
      toast.error(`Failed to test ${testName}: ${error.message}`);
    } finally {
      setTesting(false);
      setActiveTest('');
    }
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Admin access required to test Rapid API
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Rapid API Testing Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleTest('test-schedule', 'Schedule API')}
              disabled={testing}
              className="flex items-center space-x-2"
            >
              {testing && activeTest === 'Schedule API' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span>Test Schedule</span>
            </Button>

            <Button
              onClick={() => handleTest('test-teams', 'Teams API')}
              disabled={testing}
              className="flex items-center space-x-2"
            >
              {testing && activeTest === 'Teams API' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              <span>Test Teams</span>
            </Button>

            <Button
              onClick={() => handleTest('compare-data', 'Data Comparison')}
              disabled={testing}
              className="flex items-center space-x-2"
            >
              {testing && activeTest === 'Data Comparison' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>Compare Data</span>
            </Button>

            <Button
              onClick={() => handleTest('test-all', 'Full Test Suite')}
              disabled={testing}
              variant="default"
              className="flex items-center space-x-2"
            >
              {testing && activeTest === 'Full Test Suite' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              <span>Test All</span>
            </Button>
          </div>

          {testing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Testing {activeTest}... This may take a few seconds.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span>Test Results</span>
              <Badge variant={results.success ? 'default' : 'destructive'}>
                {results.success ? 'Success' : 'Failed'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={results.success ? 'border-green-200' : 'border-red-200'}>
              <AlertDescription>{results.message}</AlertDescription>
            </Alert>

            {results.schedule && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schedule API Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Data Structure:</p>
                      <Badge variant="outline">{results.schedule.dataStructure?.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Fixtures:</p>
                      <Badge>{results.schedule.totalFixtures}</Badge>
                    </div>
                  </div>
                  
                  {results.schedule.sampleFixtures && (
                    <div>
                      <p className="text-sm font-medium mb-2">Sample Fixtures:</p>
                      <div className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                        <pre>{JSON.stringify(results.schedule.sampleFixtures, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {results.teams && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Teams API Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Data Structure:</p>
                      <Badge variant="outline">{results.teams.dataStructure?.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Teams:</p>
                      <Badge>{results.teams.totalTeams}</Badge>
                    </div>
                  </div>
                  
                  {results.teams.sampleTeams && (
                    <div>
                      <p className="text-sm font-medium mb-2">Sample Teams:</p>
                      <div className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                        <pre>{JSON.stringify(results.teams.sampleTeams, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {results.comparison && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Database Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.comparison.currentData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Current Gameweek:</p>
                          <Badge>{results.comparison.currentData.gameweek?.number}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">DB Teams:</p>
                          <Badge>{results.comparison.currentData.teams}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">DB Fixtures:</p>
                          <Badge>{results.comparison.currentData.fixtures}</Badge>
                        </div>
                      </div>
                      
                      {results.comparison.currentData.fixturesSample && (
                        <div>
                          <p className="text-sm font-medium mb-2">Current Fixtures Sample:</p>
                          <div className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                            <pre>{JSON.stringify(results.comparison.currentData.fixturesSample, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Single test results */}
            {results.dataStructure && !results.schedule && !results.teams && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Data Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    <pre>{JSON.stringify(results.dataStructure, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {(results.sampleFixtures || results.sampleTeams) && !results.schedule && !results.teams && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    <pre>{JSON.stringify(results.sampleFixtures || results.sampleTeams, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {results.error && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Error Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-3 rounded text-xs overflow-auto">
                    <pre>{results.error}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
