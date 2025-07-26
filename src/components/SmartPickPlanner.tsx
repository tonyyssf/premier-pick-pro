import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PickRecommendation } from '@/utils/getPickRecommendations';

interface SmartPickPlannerProps {
  recommendations: PickRecommendation[];
  remainingTokens: Record<string, number>;
  isPremium: boolean;
  isLoading?: boolean;
}

export const SmartPickPlanner: React.FC<SmartPickPlannerProps> = ({
  recommendations,
  remainingTokens,
  isPremium,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Smart Pick Planner
            {!isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show limited data for free users (first item only)
  const displayRecommendations = isPremium ? recommendations : recommendations.slice(0, 1);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Smart Pick Planner
          {!isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-3", !isPremium && "overflow-hidden")}>
          {displayRecommendations.map((rec, index) => (
            <div
              key={`${rec.club}-${rec.gw}`}
              className={cn(
                "flex items-center gap-3 p-3 border rounded-lg transition-all",
                index === 0 ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200" : "bg-white"
              )}
            >
              {/* Team Crest */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {rec.club.charAt(0)}
              </div>
              
              {/* Club Info */}
              <div className="flex-1">
                <div className="font-medium text-sm">{rec.club}</div>
                <div className="text-xs text-muted-foreground">
                  Win Probability: {(rec.winProb * 100).toFixed(1)}%
                </div>
              </div>
              
              {/* Remaining Tokens */}
              <Badge variant="secondary" className="text-xs">
                x{remainingTokens[rec.club] || 0} left
              </Badge>
            </div>
          ))}
          
          {!isPremium && recommendations.length > 1 && (
            <div className="text-center text-sm text-muted-foreground py-2">
              +{recommendations.length - 1} more recommendations available with Premium
            </div>
          )}
        </div>
        
        {/* Premium overlay for free users */}
        {!isPremium && recommendations.length > 1 && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-[2px] flex items-end justify-center pb-4">
            <div className="text-center space-y-2">
              <Lock className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">
                Unlock all recommendations with Premium
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 