import { Suspense, lazy } from 'react';
import { ChartSkeleton } from '@/components/ui/enhanced-skeleton';

// Lazy load chart components to reduce initial bundle size
const HeatMapChart = lazy(() => 
  import('./insights/HeatMapChart').then(module => ({ 
    default: module.HeatMapChart 
  }))
);

const EfficiencyLineChart = lazy(() => 
  import('./insights/EfficiencyLineChart').then(module => ({ 
    default: module.EfficiencyLineChart 
  }))
);

const ProjectionStat = lazy(() => 
  import('./insights/ProjectionStat').then(module => ({ 
    default: module.ProjectionStat 
  }))
);

// Wrapper components with error boundaries and lazy loading
export const LazyHeatMapChart = ({ data, isPremium, isLoading }: any) => (
  <Suspense fallback={<ChartSkeleton title="Team Win Probabilities" />}>
    <HeatMapChart 
      data={data}
      isPremium={isPremium}
      isLoading={isLoading}
    />
  </Suspense>
);

export const LazyEfficiencyLineChart = ({ data, isPremium, isLoading }: any) => (
  <Suspense fallback={<ChartSkeleton title="Points Efficiency by Gameweek" />}>
    <EfficiencyLineChart 
      data={data}
      isPremium={isPremium}
      isLoading={isLoading}
    />
  </Suspense>
);

export const LazyProjectionStat = ({ data, isPremium, isLoading }: any) => (
  <Suspense fallback={<ChartSkeleton title="Season Projections" />}>
    <ProjectionStat 
      data={data}
      isPremium={isPremium}
      isLoading={isLoading}
    />
  </Suspense>
);