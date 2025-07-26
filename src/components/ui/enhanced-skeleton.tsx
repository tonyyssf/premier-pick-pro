import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedSkeletonProps {
  className?: string;
  variant?: "default" | "chart" | "card" | "text";
  lines?: number;
  animated?: boolean;
}

export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  className,
  variant = "default",
  lines = 1,
  animated = true,
}) => {
  const baseClasses = cn(
    "animate-pulse",
    animated && "animate-pulse",
    className
  );

  switch (variant) {
    case "chart":
      return (
        <div className={cn("space-y-4", baseClasses)}>
          {/* Chart header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Chart content skeleton with realistic chart shape */}
          <div className="relative">
            <Skeleton className="h-80 w-full rounded-lg" />
            {/* Chart grid lines simulation */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-20">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-px bg-muted-foreground/30" />
              ))}
            </div>
            {/* Chart bars/points simulation */}
            <div className="absolute inset-0 flex items-end justify-around p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-8 rounded-sm" 
                  style={{ 
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "card":
      return (
        <div className={cn("space-y-3", baseClasses)}>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );

    case "text":
      return (
        <div className={cn("space-y-2", baseClasses)}>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "h-4",
                i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      );

    default:
      return <Skeleton className={baseClasses} />;
  }
};

// Specialized chart loading components
export const ChartSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div className="space-y-4">
    {title && (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    )}
    <EnhancedSkeleton variant="chart" />
  </div>
);

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    ))}
  </div>
); 