
import React from 'react';
import { useLeagueAnalytics } from '@/hooks/useLeagueAnalytics';
import { LeagueMetricCards } from '@/components/analytics/LeagueMetricCards';
import { LeagueAnalyticsCharts } from '@/components/analytics/LeagueAnalyticsCharts';
import { LeagueAnalyticsLoading } from '@/components/analytics/LeagueAnalyticsLoading';

export const LeagueAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useLeagueAnalytics();

  if (isLoading) {
    return <LeagueAnalyticsLoading />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <LeagueMetricCards stats={stats} />

      {/* Charts */}
      <LeagueAnalyticsCharts stats={stats} />
    </div>
  );
};
