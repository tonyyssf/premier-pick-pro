
import { lazy } from 'react';

// Lazy load heavy components to improve initial bundle size
export const LazyLeaderboards = lazy(() => import('@/pages/OptimizedLeaderboards'));
export const LazyLeagueAnalytics = lazy(() => import('@/components/LeagueAnalytics').then(module => ({ default: module.LeagueAnalytics })));
export const LazyAdminDataSync = lazy(() => import('@/components/AdminDataSync'));
export const LazySystemMonitoringDashboard = lazy(() => import('@/components/SystemMonitoringDashboard').then(module => ({ default: module.SystemMonitoringDashboard })));

// Wrapper components with better loading states
export const LazyLoadWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      {fallback || (
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plpe-purple"></div>
          <span className="text-sm text-gray-600">Loading component...</span>
        </div>
      )}
      {children}
    </div>
  );
};
