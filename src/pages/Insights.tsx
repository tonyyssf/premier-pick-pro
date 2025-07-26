import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsights } from '@/hooks/useInsights';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumUpgrade } from '@/hooks/usePremiumUpgrade';
import { LazyHeatMapChart, LazyEfficiencyLineChart, LazyProjectionStat } from '@/components/LazyChartComponents';
import { SmartPickPlanner } from '@/components/SmartPickPlanner';
import { PickEfficiencyGauge } from '@/components/PickEfficiencyGauge';
import { UnlockBanner } from '@/components/insights/UnlockBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ExportOptions } from '@/components/ExportOptions';
import { usePremiumAccess } from '@/guards/usePremiumAccess';
import { getPickRecommendations } from '@/utils/getPickRecommendations';
import { useCurrentGameweek } from '@/hooks/useCurrentGameweek';
import { toast } from '@/hooks/use-toast';
import { analytics } from '@/utils/analytics';
import { BarChart3, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

const Insights = () => {
  const { user } = useAuth();
  const { data: insights, isLoading, error } = useInsights();
  const { verifyPayment } = usePremiumUpgrade();
  const isPremium = usePremiumAccess();
  const currentGameweek = useCurrentGameweek();
  
  // Generate pick recommendations
  const recommendations = insights ? getPickRecommendations(
    insights.heatmap.map(item => [item.winProbability]),
    insights.remainingTokens || {},
    currentGameweek
  ) : [];

  // Track insights page view
  useEffect(() => {
    analytics.trackInsightsView(isPremium);
    analytics.trackUserEngagement('insights_view');
  }, [isPremium]);

  // Handle payment success/failure from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      // Track successful premium upgrade
      analytics.trackPremiumUpgradeCompleted('stripe', 9.99);
      analytics.trackUserEngagement('premium_upgrade');
      
      verifyPayment(sessionId);
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      // Track cancelled premium upgrade
      analytics.trackPremiumUpgradeCancelled('user_cancelled');
      
      toast({
        title: "Payment Cancelled",
        description: "Your premium upgrade was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifyPayment]);

  // Track chart interactions
  const handleChartInteraction = (chartType: 'heatmap' | 'efficiency' | 'projections', action: 'view' | 'hover' | 'click') => {
    analytics.trackInsightsChartInteraction(chartType, action);
    analytics.trackUserEngagement('chart_interaction');
  };

  if (error) {
    // Track error occurrence
    analytics.trackError('insights_load_failed', 'insights_page');
    
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Unable to Load Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  There was an error loading your insights data. This might be a temporary issue.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">
            Deep insights into your performance, team analysis, and season projections.
          </p>
        </div>


        {/* Smart Pick Planner - First Section */}
        <div className="mb-8">
          <ErrorBoundary>
            <SmartPickPlanner 
              recommendations={recommendations}
              remainingTokens={insights?.remainingTokens || {}}
              isPremium={isPremium}
              isLoading={isLoading}
            />
          </ErrorBoundary>
        </div>

        {/* Export Options for Premium Users */}
        {isPremium && insights && (
          <div className="mb-6">
            <ExportOptions 
              data={insights}
              isPremium={isPremium}
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pick Efficiency Gauge - First on large screens */}
          <ErrorBoundary>
            <div onMouseEnter={() => handleChartInteraction('efficiency', 'view')}>
              <PickEfficiencyGauge 
                efficiencyData={insights?.efficiency || []}
                isPremium={isPremium}
                isLoading={isLoading}
              />
            </div>
          </ErrorBoundary>

          {/* Heat Map Chart */}
          <ErrorBoundary>
            <div onMouseEnter={() => handleChartInteraction('heatmap', 'view')}>
              <LazyHeatMapChart 
                data={insights?.heatmap}
                isPremium={isPremium}
                isLoading={isLoading}
              />
            </div>
          </ErrorBoundary>
        </div>

        {/* Projection Stats for Premium Users */}
        {isPremium && insights?.projections && (
          <ErrorBoundary>
            <div onMouseEnter={() => handleChartInteraction('projections', 'view')}>
              <LazyProjectionStat 
                projections={insights.projections}
                currentGameweek={insights.currentGameweek}
                isLoading={isLoading}
              />
            </div>
          </ErrorBoundary>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights?.totalPoints || 0}</div>
              <p className="text-xs text-muted-foreground">
                Season total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights?.winRate ? `${(insights.winRate * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Correct picks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Picks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights?.totalPicks || 0}</div>
              <p className="text-xs text-muted-foreground">
                Picks made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GW</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights?.currentGameweek || 1}</div>
              <p className="text-xs text-muted-foreground">
                Active gameweek
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Insights;