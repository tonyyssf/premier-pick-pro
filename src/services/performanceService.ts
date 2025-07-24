import { performanceMonitor } from "@/utils/performanceMonitor";

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  bundleSize: number;
  memoryUsage: number;
  apiResponseTimes: Record<string, number>;
  componentRenderTimes: Record<string, number>;
}

export interface PerformanceThresholds {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  apiResponseTime: number;
  componentRenderTime: number;
  memoryUsage: number;
}

class PerformanceService {
  private thresholds: PerformanceThresholds = {
    pageLoadTime: 3000, // 3s
    firstContentfulPaint: 1800, // 1.8s
    largestContentfulPaint: 2500, // 2.5s
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100, // 100ms
    apiResponseTime: 500, // 500ms
    componentRenderTime: 16, // 16ms (60fps)
    memoryUsage: 50 * 1024 * 1024, // 50MB
  };

  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
    this.measurePageLoad();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      const vitalsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processVitalsEntry(entry);
        }
      });

      try {
        vitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        this.observers.push(vitalsObserver);
      } catch (e) {
        console.warn('Performance observer not supported:', e);
      }

      // Navigation timing observer
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processNavigationEntry(entry as PerformanceNavigationTiming);
        }
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported:', e);
      }
    }
  }

  private processVitalsEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.metrics.largestContentfulPaint = entry.startTime;
        this.checkThreshold('largestContentfulPaint', entry.startTime);
        break;
      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
        this.checkThreshold('firstInputDelay', this.metrics.firstInputDelay);
        break;
      case 'layout-shift':
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          this.metrics.cumulativeLayoutShift = (this.metrics.cumulativeLayoutShift || 0) + clsEntry.value;
          this.checkThreshold('cumulativeLayoutShift', this.metrics.cumulativeLayoutShift);
        }
        break;
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    this.metrics.pageLoadTime = entry.loadEventEnd - entry.loadEventStart;
    this.metrics.firstContentfulPaint = entry.domContentLoadedEventEnd - entry.loadEventStart;
    this.metrics.timeToInteractive = entry.domInteractive - entry.loadEventStart;

    this.checkThreshold('pageLoadTime', this.metrics.pageLoadTime);
    this.checkThreshold('firstContentfulPaint', this.metrics.firstContentfulPaint);
  }

  private measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measureMemoryUsage();
        this.measureBundleSize();
      }, 100);
    });
  }

  private measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      this.checkThreshold('memoryUsage', this.metrics.memoryUsage);
    }
  }

  private measureBundleSize() {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const totalSize = jsResources.reduce((sum, resource) => {
        return sum + (resource.transferSize || 0);
      }, 0);
      this.metrics.bundleSize = totalSize;
    }
  }

  measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    return performanceMonitor.measureAsync(`api-${name}`, apiCall).then(result => {
      const duration = performanceMonitor.getAverageTime(`api-${name}`);
      if (!this.metrics.apiResponseTimes) {
        this.metrics.apiResponseTimes = {};
      }
      this.metrics.apiResponseTimes[name] = duration;
      this.checkThreshold('apiResponseTime', duration);
      return result;
    });
  }

  measureComponentRender(componentName: string, renderFn: () => void): number {
    performanceMonitor.startTiming(`component-${componentName}`);
    renderFn();
    const duration = performanceMonitor.endTiming(`component-${componentName}`);
    
    if (!this.metrics.componentRenderTimes) {
      this.metrics.componentRenderTimes = {};
    }
    this.metrics.componentRenderTimes[componentName] = duration;
    this.checkThreshold('componentRenderTime', duration);
    return duration;
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number) {
    const threshold = this.thresholds[metric];
    if (value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric}: ${value} > ${threshold}`);
      this.reportPerformanceIssue(metric, value, threshold);
    }
  }

  private reportPerformanceIssue(metric: string, value: number, threshold: number) {
    // In a real app, this would send to analytics/monitoring service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'performance_threshold_exceeded', {
        metric,
        value,
        threshold,
        page: window.location.pathname,
      });
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getPerformanceScore(): number {
    const scores = [];

    if (this.metrics.pageLoadTime) {
      scores.push(Math.max(0, 100 - (this.metrics.pageLoadTime / this.thresholds.pageLoadTime) * 100));
    }

    if (this.metrics.largestContentfulPaint) {
      scores.push(Math.max(0, 100 - (this.metrics.largestContentfulPaint / this.thresholds.largestContentfulPaint) * 100));
    }

    if (this.metrics.firstInputDelay) {
      scores.push(Math.max(0, 100 - (this.metrics.firstInputDelay / this.thresholds.firstInputDelay) * 100));
    }

    if (this.metrics.cumulativeLayoutShift) {
      scores.push(Math.max(0, 100 - (this.metrics.cumulativeLayoutShift / this.thresholds.cumulativeLayoutShift) * 100));
    }

    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  generateReport(): string {
    const score = this.getPerformanceScore();
    const metrics = this.getMetrics();

    return `
Performance Report (Score: ${score.toFixed(1)}/100)
=================
Page Load Time: ${metrics.pageLoadTime?.toFixed(0) || 'N/A'}ms
First Contentful Paint: ${metrics.firstContentfulPaint?.toFixed(0) || 'N/A'}ms
Largest Contentful Paint: ${metrics.largestContentfulPaint?.toFixed(0) || 'N/A'}ms
First Input Delay: ${metrics.firstInputDelay?.toFixed(0) || 'N/A'}ms
Cumulative Layout Shift: ${metrics.cumulativeLayoutShift?.toFixed(3) || 'N/A'}
Memory Usage: ${metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(1) + 'MB' : 'N/A'}
Bundle Size: ${metrics.bundleSize ? (metrics.bundleSize / 1024).toFixed(1) + 'KB' : 'N/A'}

API Response Times:
${Object.entries(metrics.apiResponseTimes || {}).map(([name, time]) => `  ${name}: ${time.toFixed(0)}ms`).join('\n')}

Component Render Times:
${Object.entries(metrics.componentRenderTimes || {}).map(([name, time]) => `  ${name}: ${time.toFixed(1)}ms`).join('\n')}
    `.trim();
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceService = new PerformanceService();