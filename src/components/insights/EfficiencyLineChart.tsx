import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EfficiencyData {
  gameweek: number;
  pointsEarned: number;
  maxPossible: number;
  efficiency: number;
}

interface EfficiencyLineChartProps {
  data?: EfficiencyData[];
  isPremium: boolean;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

export const EfficiencyLineChart: React.FC<EfficiencyLineChartProps> = ({
  data = [],
  isPremium,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show limited data for free users (last 2 gameweeks only)
  const displayData = isPremium ? data : data.slice(-2);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-md">
          <p className="font-medium">Gameweek {label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Efficiency' ? `${entry.value.toFixed(1)}%` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Points Efficiency by Gameweek
          {!isPremium && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("relative", !isPremium && "overflow-hidden")}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="gameweek" 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend className="text-sm" />
              
              <Area
                type="monotone"
                dataKey="maxPossible"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                fill="url(#maxGradient)"
                name="Max Possible"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="pointsEarned"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#pointsGradient)"
                name="Points Earned"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {!isPremium && (
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-[2px] flex items-end justify-center pb-4">
              <div className="text-center space-y-2">
                <Lock className="h-6 w-6 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground font-medium">
                  Unlock full season data with Premium
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};