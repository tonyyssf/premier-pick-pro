
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

// Lazy load analytics components
export const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

export const LazyLeagueAnalytics = lazy(() => import('./LeagueAnalytics'));

// Lazy load chart components
export const LazyEfficiencyLineChart = lazy(() => import('./insights/EfficiencyLineChart'));

export const LazyHeatMapChart = lazy(() => import('./insights/HeatMapChart'));

export const LazyProjectionStat = lazy(() => import('./insights/ProjectionStat'));

// Lazy load performance monitoring components
export const LazyPerformanceDashboard = lazy(() => import('./PerformanceDashboard'));

export const LazySystemMonitoringDashboard = lazy(() => import('./SystemMonitoringDashboard'));

// Lazy load security components
export const LazySecurityAuditDashboard = lazy(() => import('./SecurityAuditDashboard'));

export const LazyEnhancedSecurityMonitor = lazy(() => import('./EnhancedSecurityMonitor'));

// Lazy load export components
export const LazyExportOptions = lazy(() => import('./ExportOptions'));

// Lazy load onboarding components
export const LazyOnboardingFlow = lazy(() => import('./onboarding/OnboardingFlow'));

// Lazy load user settings components
export const LazyUserSettingsDialog = lazy(() => import('./UserSettingsDialog'));

// Lazy load game rules modal
export const LazyGameRulesModal = lazy(() => import('./GameRulesModal'));

// Lazy load smart pick planner
export const LazySmartPickPlanner = lazy(() => import('./SmartPickPlanner'));

// Lazy load pick efficiency gauge
export const LazyPickEfficiencyGauge = lazy(() => import('./PickEfficiencyGauge'));

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
