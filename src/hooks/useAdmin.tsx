
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { adminSyncLimiter, checkRateLimit } from '@/utils/rateLimiter';

export const useAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data?.role === 'admin';
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const checkSyncRateLimit = () => {
    if (!user) return { allowed: false, timeUntilReset: 0 };
    
    return checkRateLimit(adminSyncLimiter, user.id);
  };

  return {
    isAdmin: !!isAdmin,
    isLoading,
    checkSyncRateLimit,
  };
};
