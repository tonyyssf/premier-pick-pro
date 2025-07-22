
import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PerformanceDebugger: React.FC = () => {
  const [metrics, setMetrics] = useState<Map<string, any>>(new Map());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(new Map(performanceMonitor.getMetrics() as Map<string, any>));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-md"
        >
          📊 Performance
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Metrics</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={() => performanceMonitor.clear()}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Array.from(metrics.entries()).map(([name, metricList]) => {
              const avgTime = performanceMonitor.getAverageTime(name);
              const lastMetric = metricList[metricList.length - 1];
              
              return (
                <div key={name} className="text-xs">
                  <div className="font-medium text-gray-800 truncate">{name}</div>
                  <div className="text-gray-600">
                    Last: {lastMetric?.duration.toFixed(1)}ms | 
                    Avg: {avgTime.toFixed(1)}ms | 
                    Count: {metricList.length}
                  </div>
                  {avgTime > 100 && (
                    <div className="text-red-500 text-xs">⚠️ Slow operation</div>
                  )}
                </div>
              );
            })}
            {metrics.size === 0 && (
              <div className="text-gray-500 text-xs">No metrics collected yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
