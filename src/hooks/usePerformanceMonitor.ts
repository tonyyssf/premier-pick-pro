import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
}

interface UsePerformanceMonitorOptions {
  componentName?: string;
  enabled?: boolean;
  logThreshold?: number; // Log if render time exceeds this threshold (ms)
  maxRenderCount?: number; // Stop monitoring after this many renders
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    componentName = 'Unknown Component',
    enabled = process.env.NODE_ENV === 'development',
    logThreshold = 16, // 16ms = 60fps threshold
    maxRenderCount = 100,
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
  });

  const startTimeRef = useRef<number>(0);

  // Start timing the render
  const startRender = useCallback(() => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  }, [enabled]);

  // End timing the render
  const endRender = useCallback(() => {
    if (!enabled) return;

    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;

    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    // Log slow renders
    if (renderTime > logThreshold) {
      console.warn(
        `🚨 Slow render detected in ${componentName}:`,
        `${renderTime.toFixed(2)}ms (threshold: ${logThreshold}ms)`,
        `(avg: ${metrics.averageRenderTime.toFixed(2)}ms, total: ${metrics.renderCount})`
      );
    }

    // Log performance summary periodically
    if (metrics.renderCount % 10 === 0) {
      console.log(
        `📊 ${componentName} performance:`,
        `avg: ${metrics.averageRenderTime.toFixed(2)}ms,`,
        `last: ${renderTime.toFixed(2)}ms,`,
        `total: ${metrics.renderCount} renders`
      );
    }

    // Stop monitoring after max renders
    if (metrics.renderCount >= maxRenderCount) {
      console.log(
        `✅ ${componentName} monitoring complete:`,
        `final avg: ${metrics.averageRenderTime.toFixed(2)}ms over ${metrics.renderCount} renders`
      );
    }
  }, [enabled, componentName, logThreshold, maxRenderCount]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
    };
  }, []);

  // Auto-start timing on mount
  useEffect(() => {
    if (enabled) {
      startRender();
    }
  }, [enabled, startRender]);

  // Auto-end timing after render
  useEffect(() => {
    if (enabled) {
      // Use requestAnimationFrame to ensure we measure after the render is complete
      requestAnimationFrame(() => {
        endRender();
      });
    }
  }, [enabled, endRender]);

  return {
    startRender,
    endRender,
    getMetrics,
    resetMetrics,
    isEnabled: enabled,
  };
};

// Hook for measuring specific operations
export const useOperationTimer = (operationName: string) => {
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTimer = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }, [operationName]);

  return { startTimer, endTimer };
};

// Hook for measuring async operations
export const useAsyncTimer = (operationName: string) => {
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTimer = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }, [operationName]);

  const measureAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startTimer();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      endTimer();
    }
  }, [startTimer, endTimer]);

  return { startTimer, endTimer, measureAsync };
};

// Hook for measuring re-render frequency
export const useRenderFrequency = (componentName: string, threshold = 1000) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    renderCountRef.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    if (timeSinceLastRender < threshold) {
      console.warn(
        `🔄 ${componentName} re-rendering too frequently:`,
        `${timeSinceLastRender.toFixed(2)}ms since last render`,
        `(total: ${renderCountRef.current})`
      );
    }
  }, [componentName, threshold]);

  return renderCountRef.current;
}; 