import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAdminUpgrade() {
  const [isLoading, setIsLoading] = useState(false);

  const upgradeUser = async (userEmail: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-upgrade-user', {
        body: { userEmail }
      });
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "User Upgraded!",
          description: `Premium features have been activated for ${userEmail}`,
        });
        return { success: true };
      } else {
        throw new Error(data?.message || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Admin upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "There was an error upgrading the user. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    upgradeUser,
    isLoading
  };
}