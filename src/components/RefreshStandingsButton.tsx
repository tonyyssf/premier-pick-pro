
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useStandingsRefresh } from '@/hooks/useStandingsRefresh';

interface RefreshStandingsButtonProps {
  onRefreshComplete?: () => void;
}

export const RefreshStandingsButton: React.FC<RefreshStandingsButtonProps> = ({
  onRefreshComplete
}) => {
  const { refreshUserStandings, isRefreshing } = useStandingsRefresh();

  const handleRefresh = async () => {
    const success = await refreshUserStandings();
    if (success && onRefreshComplete) {
      onRefreshComplete();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Rankings'}
    </Button>
  );
};
