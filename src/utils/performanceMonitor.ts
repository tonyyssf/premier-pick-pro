// Use browser's native performance API

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  startTiming(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  endTiming(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`No start time found for ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getMetrics(name?: string): PerformanceMetric[] | Map<string, PerformanceMetric[]> {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return this.metrics;
  }

  getAverageTime(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.duration, 0);
    return sum / metrics.length;
  }

  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }

  // Utility for measuring async operations
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startTiming(name);
    try {
      const result = await operation();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Utility for measuring sync operations
  measure<T>(name: string, operation: () => T): T {
    this.startTiming(name);
    try {
      const result = operation();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render times
export const usePerformanceMonitor = (componentName: string) => {
  const startRender = () => performanceMonitor.startTiming(`${componentName}-render`);
  const endRender = () => performanceMonitor.endTiming(`${componentName}-render`);
  
  return { startRender, endRender };
};

// Higher-order component for automatic performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: any,
  componentName?: string
) => {
  const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // Return a function that creates the wrapped component
  return (props: P) => {
    // This would need to be used in a .tsx file with proper React imports
    console.log(`Rendering ${name} with performance monitoring`);
    return WrappedComponent(props);
  };
};
