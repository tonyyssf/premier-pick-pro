
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
      // Use explicit any type for the RPC call since the function isn't in the generated types yet
      const { data, error } = await (supabase.rpc as any)('check_ranking_integrity');
      
      if (error) throw error;
      
      // Ensure data is an array and filter for significant issues
      const dataArray = Array.isArray(data) ? data : [];
      const significantIssues = dataArray.filter((issue: RankingIssue) => issue.issue_count > 0);
      setIssues(significantIssues);
      
      // Always show a toast with the results
      if (significantIssues.length > 0) {
        toast({
          title: "Ranking Issues Detected",
          description: `Found ${significantIssues.length} ranking integrity issues`,
          variant: "destructive",
        });
        
        // Log detailed information for debugging
        console.log('Ranking integrity issues:', significantIssues);
      } else {
        toast({
          title: "No Issues Found",
          description: "All rankings are in good order",
          variant: "default",
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
      // Use explicit any type for the RPC call since the function isn't in the generated types yet
      const { data, error } = await (supabase.rpc as any)('admin_refresh_rankings');
      
      if (error) throw error;
      
      toast({
        title: "Rankings Refreshed",
        description: typeof data === 'string' ? data : "Rankings have been successfully refreshed",
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

  const debugRankingData = async () => {
    try {
      // Check user standings
      const { data: userStandings, error: userError } = await supabase
        .from('user_standings')
        .select('*')
        .order('current_rank', { ascending: true, nullsFirst: false });
      
      if (userError) throw userError;
      
      // Check league standings  
      const { data: leagueStandings, error: leagueError } = await supabase
        .from('league_standings')
        .select('*, leagues(name)')
        .order('league_id, current_rank', { ascending: true, nullsFirst: false });
      
      if (leagueError) throw leagueError;
      
      console.log('User standings debug:', userStandings);
      console.log('League standings debug:', leagueStandings);
      
      // Check for users without standings
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name');
        
      if (profilesError) throw profilesError;
      
      const userIds = userStandings?.map(s => s.user_id) || [];
      const missingStandings = profiles?.filter(p => !userIds.includes(p.id)) || [];
      
      console.log('Users without standings:', missingStandings);
      
      toast({
        title: "Debug Data Logged",
        description: "Check console for detailed ranking data",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error('Error debugging ranking data:', error);
      toast({
        title: "Error Debugging Rankings",
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
    refreshAllRankings,
    debugRankingData
  };
};
