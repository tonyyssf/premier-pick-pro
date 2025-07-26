
import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Loading components for different contexts
const AdminLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

const ChartLoadingSkeleton = () => (
  <div className="h-64 bg-gray-200 rounded animate-pulse flex items-center justify-center">
    <div className="text-gray-500">Loading chart...</div>
  </div>
);

// Lazy load heavy admin components
export const LazyAdmin = lazy(() => import('../pages/Admin'));

// Temporarily disable lazy loading for components that don't have proper exports
// These will need to be checked individually for proper default exports

// Lazy load insights components
export const LazyInsights = lazy(() => import('../pages/Insights'));

// Lazy load leaderboard components  
export const LazyOptimizedLeaderboards = lazy(() => import('../pages/OptimizedLeaderboards'));


// Wrapper components with proper loading states
export const AdminLazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<AdminLoadingSkeleton />}>
    {children}
  </Suspense>
);

export const AnalyticsLazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<AnalyticsLoadingSkeleton />}>
    {children}
  </Suspense>
);

export const ChartLazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<ChartLoadingSkeleton />}>
    {children}
  </Suspense>
);

// Hook for preloading components
export const usePreloadComponent = () => {
  const preloadComponent = React.useCallback((componentPath: string) => {
    // Start preloading the component
    import(`../components/${componentPath}`);
  }, []);

  return preloadComponent;
};

// Component for conditional lazy loading
interface ConditionalLazyLoadProps {
  condition: boolean;
  component: React.ComponentType;
  loadingComponent?: React.ComponentType;
  fallback?: React.ComponentType;
}

export const ConditionalLazyLoad: React.FC<ConditionalLazyLoadProps> = ({
  condition,
  component: Component,
  loadingComponent: LoadingComponent = LoadingSpinner,
  fallback: Fallback
}) => {
  if (!condition) {
    return Fallback ? <Fallback /> : null;
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      <Component />
    </Suspense>
  );
};
