import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EfficiencyData, calcOverallEfficiency } from '@/utils/calcEfficiency';

interface PickEfficiencyGaugeProps {
  efficiencyData: EfficiencyData[];
  isPremium: boolean;
  isLoading?: boolean;
}

export const PickEfficiencyGauge: React.FC<PickEfficiencyGaugeProps> = ({
  efficiencyData,
  isPremium,
  isLoading = false
}) => {
  const overallEfficiency = calcOverallEfficiency(efficiencyData);
  
  // Show limited data for free users (last 2 gameweeks only)
  const displayData = isPremium ? efficiencyData : efficiencyData.slice(-2);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pick Efficiency
            {!isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto" />
              </div>
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyStatus = (efficiency: number) => {
    if (efficiency >= 80) return 'Excellent';
    if (efficiency >= 60) return 'Good';
    if (efficiency >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pick Efficiency
          {!isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", !isPremium && "overflow-hidden")}>
          {/* Circular Progress Gauge */}
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - overallEfficiency / 100)}`}
                  className={getEfficiencyColor(overallEfficiency)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn("text-2xl font-bold", getEfficiencyColor(overallEfficiency))}>
                    {overallEfficiency.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getEfficiencyStatus(overallEfficiency)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Overall Efficiency
              </div>
              <div className="text-xs text-muted-foreground">
                Based on {efficiencyData.length} gameweeks
              </div>
            </div>
          </div>

          {/* Mini Line Chart */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Efficiency Trend
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={displayData}>
                <XAxis 
                  dataKey="gameweek" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                  domain={[0, 100]}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-md">
                          <p className="font-medium text-xs">GW {label}</p>
                          <p className="text-xs" style={{ color: payload[0].color }}>
                            Efficiency: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Premium overlay for free users */}
        {!isPremium && efficiencyData.length > 2 && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-[2px] flex items-end justify-center pb-4">
            <div className="text-center space-y-2">
              <Lock className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">
                Unlock full efficiency history with Premium
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 