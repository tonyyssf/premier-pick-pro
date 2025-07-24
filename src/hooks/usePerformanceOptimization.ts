import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { performanceService } from '@/services/performanceService';

// Enhanced debounce hook with performance tracking
export function useOptimizedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when deps change
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  return useCallback(((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performanceService.measureApiCall('debounced-callback', async () => {
        callbackRef.current(...args);
      });
    }, delay);
  }) as T, [delay]);
}

// Memoization hook with performance monitoring
export function usePerformanceMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  name?: string
): T {
  return useMemo(() => {
    if (name) {
      performanceService.measureComponentRender(`memo-${name}`, factory);
    }
    return factory();
  }, deps);
}

// Optimized callback with performance tracking
export function usePerformanceCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  name?: string
): T {
  return useCallback(((...args: Parameters<T>) => {
    if (name) {
      return performanceService.measureComponentRender(`callback-${name}`, () => callback(...args));
    }
    return callback(...args);
  }) as T, deps);
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  targetRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
  freezeOnceVisible = false
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }

        if (freezeOnceVisible && hasBeenVisible) {
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [targetRef, options.threshold, options.rootMargin, freezeOnceVisible, hasBeenVisible]);

  return { isIntersecting, hasBeenVisible };
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const containerItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length, startIndex + containerItemCount + overscan * 2);

    return {
      virtualItems: items.slice(startIndex, endIndex).map((item, index) => ({
        item,
        index: startIndex + index,
        offsetTop: (startIndex + index) * itemHeight,
      })),
      totalHeight: items.length * itemHeight,
      startIndex,
      endIndex,
    };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll,
  };
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const { isIntersecting } = useIntersectionObserver(imageRef, {}, true);

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setHasError(true);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, hasError]);

  return {
    imageSrc,
    isLoaded,
    hasError,
    imageRef,
  };
}

// Bundle splitting helper
export function useDynamicImport<T>(
  importFunc: () => Promise<{ default: T }>,
  deps: React.DependencyList = []
) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const module = await performanceService.measureApiCall('dynamic-import', importFunc);
        
        if (!cancelled) {
          setComponent(module.default);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { component, loading, error };
}

// Performance monitoring for React components
export function useComponentPerformance(componentName: string) {
  const renderStartRef = useRef<number>();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      performanceService.measureComponentRender(componentName, () => {
        // Simulate render work for measurement
      });
    }
  });

  const measureAction = useCallback((actionName: string, action: () => void) => {
    performanceService.measureComponentRender(`${componentName}-${actionName}`, action);
  }, [componentName]);

  return { measureAction };
}