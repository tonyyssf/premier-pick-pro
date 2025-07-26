import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star, TrendingUp, Loader2 } from 'lucide-react';
import { usePremiumUpgrade } from '@/hooks/usePremiumUpgrade';

interface UnlockBannerProps {
  title: string;
  description: string;
}

export const UnlockBanner: React.FC<UnlockBannerProps> = ({ title, description }) => {
  const { startUpgrade, isLoading } = usePremiumUpgrade();

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-primary" />
            <span>Season projections</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Advanced analytics</span>
          </div>
        </div>

        <Button 
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
          onClick={startUpgrade}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Unlock Premium Features - $9.99'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};