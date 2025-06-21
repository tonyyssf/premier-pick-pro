
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { 
  AlertTriangle, 
  XCircle, 
  Info,
  Trash2,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const getLevelIcon = (level: 'error' | 'warning' | 'info') => {
  switch (level) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getLevelBadge = (level: 'error' | 'warning' | 'info') => {
  switch (level) {
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    case 'warning':
      return <Badge variant="default" className="bg-orange-100 text-orange-800">Warning</Badge>;
    case 'info':
      return <Badge variant="secondary">Info</Badge>;
  }
};

export const ErrorLogsMonitor: React.FC = () => {
  const { metrics, isLoading, clearErrorLogs, refetch } = useSystemMonitoring();
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Error Logs & Debugging</span>
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

  const errorCount = metrics.errorLogs.filter(log => log.level === 'error').length;
  const warningCount = metrics.errorLogs.filter(log => log.level === 'warning').length;
  const infoCount = metrics.errorLogs.filter(log => log.level === 'info').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Error Logs & Debugging</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={clearErrorLogs}
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Log Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Details */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.errorLogs.length === 0 ? (
            <div className="text-center py-8">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No logs to display</p>
              <p className="text-sm text-gray-500 mt-1">System events and errors will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {metrics.errorLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getLevelIcon(log.level)}
                        <div>
                          <div className="font-medium">{log.message}</div>
                          <div className="text-sm text-gray-500">
                            {log.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getLevelBadge(log.level)}
                        {log.details && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLogExpansion(log.id)}
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {log.details && expandedLogs.has(log.id) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="text-sm font-medium text-gray-700 mb-2">Details:</div>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Debugging Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Debugging Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Security Events</h4>
              <p className="text-sm text-gray-600 mb-3">
                Monitor authentication failures, rate limiting, and suspicious activities
              </p>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Security Logs
              </Button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">API Call Tracing</h4>
              <p className="text-sm text-gray-600 mb-3">
                Track API calls, response times, and error patterns
              </p>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View API Traces
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
