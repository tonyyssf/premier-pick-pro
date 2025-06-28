
import { useQuery } from '@tanstack/react-query';

export const useAdmin = () => {
  // Since we removed authentication, we'll return a mock admin status
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      // Mock admin check - in a real app you'd check authentication
      return true;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const checkSyncRateLimit = () => {
    return { allowed: true, timeUntilReset: 0 };
  };

  return {
    isAdmin: !!isAdmin,
    isLoading,
    checkSyncRateLimit,
  };
};
