
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { 
  Database, 
  Cloud, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Heart
} from 'lucide-react';

const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const getHealthBadge = (status: 'healthy' | 'warning' | 'error') => {
  switch (status) {
    case 'healthy':
      return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
    case 'warning':
      return <Badge variant="default" className="bg-orange-100 text-orange-800">Warning</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
  }
};

export const SystemHealthMonitor: React.FC = () => {
  const { metrics, isLoading, performHealthCheck } = useSystemMonitoring();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>System Health</span>
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

  const overallHealth = metrics.systemHealth.database === 'error' || 
                       metrics.systemHealth.edgeFunctions === 'error' 
                       ? 'error' 
                       : metrics.systemHealth.database === 'warning' || 
                         metrics.systemHealth.edgeFunctions === 'warning'
                       ? 'warning' 
                       : 'healthy';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
        <Button 
          onClick={performHealthCheck}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Health
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={
        overallHealth === 'error' ? 'border-red-200 bg-red-50' :
        overallHealth === 'warning' ? 'border-orange-200 bg-orange-50' :
        'border-green-200 bg-green-50'
      }>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            {getHealthIcon(overallHealth)}
            <div>
              <h3 className="font-semibold text-lg">
                System Status: {getHealthBadge(overallHealth)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Last checked: {metrics.systemHealth.lastHealthCheck.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Health Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Database</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getHealthIcon(metrics.systemHealth.database)}
                <span className="font-medium">Supabase Database</span>
              </div>
              {getHealthBadge(metrics.systemHealth.database)}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {metrics.systemHealth.database === 'healthy' && (
                <p>✓ Connection established and queries responding normally</p>
              )}
              {metrics.systemHealth.database === 'warning' && (
                <p>⚠ Database responding but with some issues detected</p>
              )}
              {metrics.systemHealth.database === 'error' && (
                <p>✗ Database connection failed or queries timing out</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edge Functions Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>Edge Functions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getHealthIcon(metrics.systemHealth.edgeFunctions)}
                <span className="font-medium">Supabase Functions</span>
              </div>
              {getHealthBadge(metrics.systemHealth.edgeFunctions)}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {metrics.systemHealth.edgeFunctions === 'healthy' && (
                <p>✓ All edge functions responding normally</p>
              )}
              {metrics.systemHealth.edgeFunctions === 'warning' && (
                <p>⚠ Some edge functions may be experiencing issues</p>
              )}
              {metrics.systemHealth.edgeFunctions === 'error' && (
                <p>✗ Edge functions are not responding</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Check Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Database Connection Test</div>
                <div className="text-sm text-gray-600">Verify database connectivity and response time</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => performHealthCheck()}
              >
                Test
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Edge Functions Test</div>
                <div className="text-sm text-gray-600">Check edge function availability and response</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => performHealthCheck()}
              >
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
