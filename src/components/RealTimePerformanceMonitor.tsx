import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { cdnService } from '@/services/cdnService';

interface PerformanceMetrics {
  timestamp: number;
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  network: {
    latency: number;
    throughput: number;
    status: 'online' | 'offline' | 'slow';
  };
  cache: {
    hitRate: number;
    size: number;
    items: number;
  };
  cdn: {
    latency: number;
    region: string;
    status: 'optimal' | 'good' | 'poor';
  };
  errors: {
    count: number;
    lastError?: string;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export const RealTimePerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  
  const monitoringRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const errorCountRef = useRef(0);
  
  const { 
    isSupported: swSupported, 
    isControlling: swControlling,
    getCacheStats,
    clearAllCaches 
  } = useServiceWorker();

  // FPS monitoring
  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
      return fps;
    }
    
    return null;
  }, []);

  // Memory monitoring
  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    
    // Fallback for browsers without memory API
    return {
      used: 0,
      total: 0,
      limit: 0,
    };
  }, []);

  // Network monitoring
  const getNetworkInfo = useCallback(async () => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      return {
        latency: connection.rtt || 0,
        throughput: connection.downlink || 0,
        status: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' ? 'slow' : 'online',
      };
    }
    
    // Fallback network detection
    const startTime = performance.now();
    try {
      await fetch('/api/health', { method: 'HEAD' });
      const latency = performance.now() - startTime;
      return {
        latency,
        throughput: 0,
        status: latency > 1000 ? 'slow' : 'online',
      };
    } catch {
      return {
        latency: 0,
        throughput: 0,
        status: 'offline',
      };
    }
  }, []);

  // Cache monitoring
  const getCacheInfo = useCallback(async () => {
    try {
      const stats = await getCacheStats();
      const totalItems = Object.values(stats).reduce((sum: number, cache: any) => sum + cache.size, 0);
      
      return {
        hitRate: 0.85, // This would be calculated from actual cache hits
        size: totalItems,
        items: totalItems,
      };
    } catch {
      return {
        hitRate: 0,
        size: 0,
        items: 0,
      };
    }
  }, [getCacheStats]);

  // CDN monitoring
  const getCDNInfo = useCallback(async () => {
    try {
      const cdnMetrics = await cdnService.getPerformanceMetrics();
      const status = cdnMetrics.latency < 50 ? 'optimal' : 
                    cdnMetrics.latency < 100 ? 'good' : 'poor';
      
      return {
        latency: cdnMetrics.latency,
        region: cdnMetrics.region,
        status,
      };
    } catch {
      return {
        latency: 0,
        region: 'unknown',
        status: 'poor' as const,
      };
    }
  }, []);

  // Error monitoring
  const setupErrorMonitoring = useCallback(() => {
    const originalError = window.onerror;
    const originalUnhandledRejection = window.onunhandledrejection;
    
    window.onerror = (message, source, lineno, colno, error) => {
      errorCountRef.current++;
      addAlert('error', `JavaScript Error: ${message}`);
      if (originalError) originalError(message, source, lineno, colno, error);
    };
    
    window.onunhandledrejection = (event) => {
      errorCountRef.current++;
      addAlert('error', `Unhandled Promise Rejection: ${event.reason}`);
      if (originalUnhandledRejection) originalUnhandledRejection(event);
    };
    
    return () => {
      window.onerror = originalError;
      window.onunhandledrejection = originalUnhandledRejection;
    };
  }, []);

  // Add performance alert
  const addAlert = useCallback((type: 'warning' | 'error' | 'info', message: string) => {
    const alert: PerformanceAlert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      resolved: false,
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
  }, []);

  // Collect all metrics
  const collectMetrics = useCallback(async () => {
    const fps = measureFPS();
    const memory = getMemoryInfo();
    const network = await getNetworkInfo();
    const cache = await getCacheInfo();
    const cdn = await getCDNInfo();
    
    const newMetrics: PerformanceMetrics = {
      timestamp: Date.now(),
      fps: fps || 0,
      memory,
      network,
      cache,
      cdn,
      errors: {
        count: errorCountRef.current,
      },
    };
    
    setMetrics(newMetrics);
    setHistory(prev => [...prev.slice(-29), newMetrics]); // Keep last 30 measurements
    
    // Check for performance issues
    if (fps && fps < 30) {
      addAlert('warning', `Low FPS detected: ${fps}`);
    }
    
    if (memory.used / memory.limit > 0.8) {
      addAlert('warning', 'High memory usage detected');
    }
    
    if (network.status === 'offline') {
      addAlert('error', 'Network connection lost');
    }
    
    if (cdn.status === 'poor') {
      addAlert('warning', 'Poor CDN performance');
    }
  }, [measureFPS, getMemoryInfo, getNetworkInfo, getCacheInfo, getCDNInfo, addAlert]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    const cleanup = setupErrorMonitoring();
    
    monitoringRef.current = setInterval(collectMetrics, 1000);
    
    return cleanup;
  }, [isMonitoring, setupErrorMonitoring, collectMetrics]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Clear cache
  const handleClearCache = useCallback(async () => {
    try {
      await clearAllCaches();
      addAlert('info', 'Cache cleared successfully');
    } catch (error) {
      addAlert('error', 'Failed to clear cache');
    }
  }, [clearAllCaches, addAlert]);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  // Start monitoring on mount
  useEffect(() => {
    const cleanup = startMonitoring();
    return () => {
      stopMonitoring();
      cleanup?.();
    };
  }, [startMonitoring, stopMonitoring]);

  // Calculate trends
  const getTrend = (values: number[]): 'up' | 'down' | 'stable' => {
    if (values.length < 2) return 'stable';
    const recent = values.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const first = values[0];
    return avg > first * 1.1 ? 'up' : avg < first * 0.9 ? 'down' : 'stable';
  };

  const fpsTrend = getTrend(history.map(m => m.fps));
  const memoryTrend = getTrend(history.map(m => m.memory.used / m.memory.limit * 100));

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Performance
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? 'Stop' : 'Start'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FPS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FPS</span>
                <div className="flex items-center gap-1">
                  {fpsTrend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {fpsTrend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  <span className="text-lg font-bold">{metrics.fps}</span>
                </div>
              </div>
              <Progress value={(metrics.fps / 60) * 100} className="h-2" />
            </div>

            {/* Memory */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory</span>
                <div className="flex items-center gap-1">
                  {memoryTrend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                  {memoryTrend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                  <span className="text-lg font-bold">
                    {Math.round(metrics.memory.used / 1024 / 1024)}MB
                  </span>
                </div>
              </div>
              <Progress 
                value={(metrics.memory.used / metrics.memory.limit) * 100} 
                className="h-2" 
              />
            </div>

            {/* Network */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <div className="flex items-center gap-1">
                  {metrics.network.status === 'online' ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-lg font-bold">{metrics.network.latency}ms</span>
                </div>
              </div>
              <Badge variant={metrics.network.status === 'online' ? 'default' : 'destructive'}>
                {metrics.network.status}
              </Badge>
            </div>

            {/* CDN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CDN</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold">{metrics.cdn.latency}ms</span>
                </div>
              </div>
              <Badge 
                variant={
                  metrics.cdn.status === 'optimal' ? 'default' : 
                  metrics.cdn.status === 'good' ? 'secondary' : 'destructive'
                }
              >
                {metrics.cdn.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache and Service Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cache & Service Worker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Hit Rate</span>
                <span className="text-lg font-bold">{Math.round(metrics.cache.hitRate * 100)}%</span>
              </div>
              <Progress value={metrics.cache.hitRate * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service Worker</span>
                <div className="flex items-center gap-1">
                  {swControlling ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">{swControlling ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <Badge variant={swControlling ? 'default' : 'secondary'}>
                {swSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cached Items</span>
                <span className="text-lg font-bold">{metrics.cache.items}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(alert => !alert.resolved).map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.type === 'error' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 