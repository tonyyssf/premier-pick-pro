import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceService, PerformanceMetrics } from '@/services/performanceService';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { AlertTriangle, CheckCircle, Activity, Database, Zap, BarChart3 } from 'lucide-react';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isVisible, onToggle }) => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [performanceScore, setPerformanceScore] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceService.getMetrics());
      setPerformanceScore(performanceService.getPerformanceScore());
      setLastUpdate(new Date());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-background border-2"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <h3 className="font-semibold">Performance Dashboard</h3>
        </div>
        <Button onClick={onToggle} variant="ghost" size="sm">
          ✕
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[520px]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Score
                </CardTitle>
                <CardDescription>Overall performance rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                    {performanceScore.toFixed(0)}
                  </div>
                  <div>
                    <Progress value={performanceScore} className="w-32" />
                    <Badge variant={performanceScore >= 80 ? 'default' : performanceScore >= 60 ? 'secondary' : 'destructive'}>
                      {getScoreStatus(performanceScore)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Page Load</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatTime(metrics.pageLoadTime)}
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Memory</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatSize(metrics.memoryUsage)}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="p-4 space-y-3">
            <div className="grid gap-3">
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm font-medium">First Contentful Paint</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formatTime(metrics.firstContentfulPaint)}</span>
                  {(metrics.firstContentfulPaint || 0) < 1800 ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  }
                </div>
              </div>

              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm font-medium">Largest Contentful Paint</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formatTime(metrics.largestContentfulPaint)}</span>
                  {(metrics.largestContentfulPaint || 0) < 2500 ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  }
                </div>
              </div>

              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm font-medium">First Input Delay</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{formatTime(metrics.firstInputDelay)}</span>
                  {(metrics.firstInputDelay || 0) < 100 ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  }
                </div>
              </div>

              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm font-medium">Cumulative Layout Shift</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{metrics.cumulativeLayoutShift?.toFixed(3) || 'N/A'}</span>
                  {(metrics.cumulativeLayoutShift || 0) < 0.1 ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  }
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="p-4 space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">API Response Times</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(metrics.apiResponseTimes || {}).map(([name, time]) => (
                  <div key={name} className="flex justify-between p-1 border rounded">
                    <span>{name}</span>
                    <span className={time > 500 ? 'text-red-500' : 'text-green-500'}>
                      {time.toFixed(0)}ms
                    </span>
                  </div>
                ))}
                {Object.keys(metrics.apiResponseTimes || {}).length === 0 && (
                  <div className="text-muted-foreground text-center py-2">No API calls measured yet</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Component Render Times</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(metrics.componentRenderTimes || {}).map(([name, time]) => (
                  <div key={name} className="flex justify-between p-1 border rounded">
                    <span>{name}</span>
                    <span className={time > 16 ? 'text-red-500' : 'text-green-500'}>
                      {time.toFixed(1)}ms
                    </span>
                  </div>
                ))}
                {Object.keys(metrics.componentRenderTimes || {}).length === 0 && (
                  <div className="text-muted-foreground text-center py-2">No components measured yet</div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => {
                    performanceMonitor.clear();
                    setMetrics({});
                    setPerformanceScore(0);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear Data
                </Button>
                <div className="text-xs text-muted-foreground">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};