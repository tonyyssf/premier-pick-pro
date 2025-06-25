
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RankingIssue {
  issue_type: string;
  table_name: string;
  issue_count: number;
  details: string;
}

export const useRankingIntegrity = () => {
  const [issues, setIssues] = useState<RankingIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkRankingIntegrity = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.rpc('check_ranking_integrity');
      
      if (error) throw error;
      
      const significantIssues = data.filter((issue: RankingIssue) => issue.issue_count > 0);
      setIssues(significantIssues);
      
      if (significantIssues.length > 0) {
        toast({
          title: "Ranking Issues Detected",
          description: `Found ${significantIssues.length} ranking integrity issues`,
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('Error checking ranking integrity:', error);
      toast({
        title: "Error Checking Rankings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const refreshAllRankings = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_refresh_rankings');
      
      if (error) throw error;
      
      toast({
        title: "Rankings Refreshed",
        description: data,
        variant: "default",
      });
      
      // Re-check integrity after refresh
      await checkRankingIntegrity();
      
    } catch (error: any) {
      console.error('Error refreshing rankings:', error);
      toast({
        title: "Error Refreshing Rankings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check integrity on component mount
    checkRankingIntegrity();
  }, []);

  return {
    issues,
    isChecking,
    checkRankingIntegrity,
    refreshAllRankings
  };
};
