
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, CheckCircle, Bug } from 'lucide-react';
import { useRankingIntegrity } from '@/hooks/useRankingIntegrity';

export const RankingIntegrityMonitor: React.FC = () => {
  const { issues, isChecking, checkRankingIntegrity, refreshAllRankings, debugRankingData } = useRankingIntegrity();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Ranking System Integrity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={checkRankingIntegrity}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Check Integrity
          </Button>
          <Button
            onClick={refreshAllRankings}
            variant="default"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Rankings
          </Button>
          <Button
            onClick={debugRankingData}
            variant="secondary"
            size="sm"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug Data
          </Button>
        </div>

        {issues.length === 0 && !isChecking && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">No ranking issues detected</span>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-600">Issues Found:</h4>
            {issues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div>
                  <Badge variant="destructive" className="mr-2">
                    {issue.table_name}
                  </Badge>
                  <span className="text-sm">{issue.details}</span>
                </div>
                <Badge variant="outline">
                  {issue.issue_count} affected
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
