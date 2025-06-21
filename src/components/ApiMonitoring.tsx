
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown 
} from 'lucide-react';

export const ApiMonitoring: React.FC = () => {
  const { metrics, isLoading, performHealthCheck } = useSystemMonitoring();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>API Monitoring</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const successRate = metrics.apiCalls.total > 0 
    ? (metrics.apiCalls.successful / metrics.apiCalls.total * 100).toFixed(1)
    : '0';

  const isRateLimited = metrics.rateLimit.syncOperations >= metrics.rateLimit.maxAllowed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">API Monitoring</h2>
        <Button 
          onClick={performHealthCheck}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* API Call Statistics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{metrics.apiCalls.total}</div>
              <Badge variant="secondary" className="text-xs">
                {metrics.apiCalls.lastHour} last hour
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{successRate}%</div>
              {parseFloat(successRate) > 95 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.apiCalls.successful} successful, {metrics.apiCalls.failed} failed
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {metrics.rateLimit.syncOperations}/{metrics.rateLimit.maxAllowed}
              </div>
              {isRateLimited ? (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per {metrics.rateLimit.timeWindow}
            </div>
            {isRateLimited && (
              <Badge variant="destructive" className="text-xs mt-2">
                Rate limited
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Last Health Check */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Last Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="text-sm">
                {metrics.systemHealth.lastHealthCheck.toLocaleTimeString()}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.systemHealth.lastHealthCheck.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Details */}
      {isRateLimited && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Rate Limit Reached</h3>
                <p className="text-sm text-orange-700 mt-1">
                  You've reached the maximum number of sync operations ({metrics.rateLimit.maxAllowed}) 
                  per {metrics.rateLimit.timeWindow}. 
                  {metrics.rateLimit.nextReset && (
                    <> Next reset at {metrics.rateLimit.nextReset.toLocaleTimeString()}.</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
