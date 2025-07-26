import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsights } from '@/hooks/useInsights';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumUpgrade } from '@/hooks/usePremiumUpgrade';
import { HeatMapChart } from '@/components/insights/HeatMapChart';
import { EfficiencyLineChart } from '@/components/insights/EfficiencyLineChart';
import { ProjectionStat } from '@/components/insights/ProjectionStat';
import { UnlockBanner } from '@/components/insights/UnlockBanner';
import { toast } from '@/hooks/use-toast';
import { Download, BarChart3, TrendingUp, Target, AlertCircle } from 'lucide-react';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { useEffect } from 'react';

const Insights = () => {
  const { user } = useAuth();
  const { data: insights, isLoading, error } = useInsights();
  const { verifyPayment } = usePremiumUpgrade();
  
  // Check if user is premium
  const isPremium = user?.user_metadata?.is_premium === true;

  // Handle payment success/failure from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      verifyPayment(sessionId);
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your premium upgrade was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifyPayment]);

  const handleExportCSV = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "CSV export is only available for premium users.",
        variant: "destructive",
      });
      return;
    }

    if (!insights) {
      toast({
        title: "No Data",
        description: "No insights data available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare efficiency data for CSV
      const csvData = insights.efficiency.map(item => ({
        gameweek: item.gameweek,
        points_earned: item.pointsEarned,
        max_possible: item.maxPossible,
        efficiency_percentage: item.efficiency.toFixed(1),
        win_rate: insights.winRate,
        total_points: insights.totalPoints,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `insights-export-${new Date().toISOString().split('T')[0]}.csv`);

      toast({
        title: "Export Successful",
        description: "Your insights data has been exported to CSV.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Unable to Load Insights</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There was an error loading your analytics data. Please try again later.
                  </p>
                </div>
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Advanced Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Deep insights into your season performance and projections
            </p>
          </div>
          
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!isPremium}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Overview Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{insights.totalPoints}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{insights.correctPicks}</p>
                    <p className="text-sm text-muted-foreground">Correct Picks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{insights.winRate}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{insights.currentGameweek}</p>
                    <p className="text-sm text-muted-foreground">Current GW</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Premium Banner for Free Users */}
        {!isPremium && (
          <div className="mb-8">
            <UnlockBanner
              title="Unlock Advanced Analytics"
              description="Get access to detailed performance insights, season projections, team analytics, and CSV exports with our Premium plan."
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HeatMapChart
            data={insights?.heatmap}
            isPremium={isPremium}
            isLoading={isLoading}
          />
          
          <EfficiencyLineChart
            data={insights?.efficiency}
            isPremium={isPremium}
            isLoading={isLoading}
          />
        </div>

        {/* Projections Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProjectionStat
              data={insights?.projections}
              isPremium={isPremium}
              isLoading={isLoading}
            />
          </div>
          
          {/* Additional space for future features */}
          <div className="lg:col-span-2">
            {isPremium && insights ? (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <p className="text-muted-foreground">
                      Additional analytics features coming soon!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : !isPremium ? (
              <UnlockBanner
                title="More Analytics Coming"
                description="Premium users will get access to even more detailed analytics, comparison tools, and performance insights."
              />
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Insights;