import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Treemap, Cell, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeatMapData {
  team: string;
  winProbability: number;
}

interface HeatMapChartProps {
  data?: HeatMapData[];
  isPremium: boolean;
  isLoading?: boolean;
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({
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

  // Show limited data for free users (last 2 items only)
  const displayData = isPremium ? data : data.slice(-2);
  
  // Transform data for treemap
  const treemapData = displayData.map((item, index) => ({
    name: item.team,
    value: item.winProbability,
    fill: `hsl(${(item.winProbability / 100) * 120}, 70%, ${60 + (index % 2) * 10}%)`,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Win Probability: {data.value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Team Win Probabilities
          {!isPremium && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("relative", !isPremium && "overflow-hidden")}>
          <ResponsiveContainer width="100%" height={320}>
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
          
          {!isPremium && (
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-[2px] flex items-end justify-center pb-4">
              <div className="text-center space-y-2">
                <Lock className="h-6 w-6 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground font-medium">
                  Unlock full analytics with Premium
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};