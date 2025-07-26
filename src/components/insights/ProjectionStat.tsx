import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UnlockBanner } from './UnlockBanner';

interface ProjectionData {
  p25: number;
  p50: number;
  p75: number;
  currentPoints: number;
  averagePerGameweek: number;
}

interface ProjectionStatProps {
  data?: ProjectionData;
  isPremium: boolean;
  isLoading?: boolean;
}

export const ProjectionStat: React.FC<ProjectionStatProps> = ({
  data,
  isPremium,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <UnlockBanner
        title="Season Projections"
        description="Get advanced analytics showing your projected final points with P25, P50, and P75 confidence intervals based on your current performance."
      />
    );
  }

  if (!data) return null;

  const projectionStats = [
    {
      label: 'Conservative (P25)',
      value: data.p25,
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Expected (P50)',
      value: data.p50,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Optimistic (P75)',
      value: data.p75,
      icon: Zap,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Projections</CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on {data.averagePerGameweek} points/gameweek average
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectionStats.map((stat) => {
          const Icon = stat.icon;
          const pointsToGain = stat.value - data.currentPoints;
          
          return (
            <div key={stat.label} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{stat.label}</p>
                <p className="text-sm text-muted-foreground">
                  {stat.value} points
                  {pointsToGain > 0 && (
                    <span className="text-green-600 ml-1">
                      (+{pointsToGain} to gain)
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Points:</span>
            <span className="font-medium">{data.currentPoints}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Average per GW:</span>
            <span className="font-medium">{data.averagePerGameweek}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};