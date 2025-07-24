import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { supabase } from '@/integrations/supabase/client';

// Cache configuration
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
};

// Optimized API hooks with performance monitoring
export function useOptimizedQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options: any = {}
) {
  return useQuery({
    queryKey: key,
    queryFn: () => performanceService.measureApiCall(key.join('-'), queryFn),
    ...CACHE_CONFIG,
    ...options,
  });
}

export function useOptimizedMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options: any = {}
) {
  return useMutation({
    mutationFn: (variables: V) => 
      performanceService.measureApiCall('mutation', () => mutationFn(variables)),
    ...options,
  });
}

// Optimized Supabase queries
export function useOptimizedSupabaseQuery<T = any>(
  tableName: string,
  selectQuery: string = '*',
  filters?: Record<string, any>,
  options: any = {}
) {
  const cacheKey = [tableName, selectQuery, JSON.stringify(filters || {})];
  
  return useOptimizedQuery<T>(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select(selectQuery);
      
      if (error) throw error;
      return data as T;
    },
    options
  );
}

// Batch loading hook for multiple API calls
export function useBatchLoader<T>(
  requests: Array<{ key: string[]; queryFn: () => Promise<T> }>,
  options: any = {}
) {
  const queryClient = useQueryClient();
  
  const batchQuery = useQuery({
    queryKey: ['batch', ...requests.map(r => r.key.join('-'))],
    queryFn: async () => {
      const startTime = performance.now();
      
      const results = await Promise.allSettled(
        requests.map(request => 
          performanceService.measureApiCall(
            `batch-${request.key.join('-')}`,
            request.queryFn
          )
        )
      );
      
      const endTime = performance.now();
      console.log(`Batch loaded ${requests.length} requests in ${endTime - startTime}ms`);
      
      // Cache individual results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          queryClient.setQueryData(requests[index].key, result.value);
        }
      });
      
      return results;
    },
    ...CACHE_CONFIG,
    ...options,
  });
  
  return batchQuery;
}

// Infinite scroll optimization
export function useOptimizedInfiniteQuery<T>(
  key: string[],
  queryFn: ({ pageParam }: { pageParam?: any }) => Promise<T>,
  options: any = {}
) {
  return useQuery({
    queryKey: key,
    queryFn: ({ pageParam = 0 }) => 
      performanceService.measureApiCall(
        `${key.join('-')}-page-${pageParam}`,
        () => queryFn({ pageParam })
      ),
    ...CACHE_CONFIG,
    ...options,
  });
}

// Prefetch utilities
export function usePrefetch() {
  const queryClient = useQueryClient();
  
  const prefetchQuery = (
    key: string[],
    queryFn: () => Promise<any>,
    delay = 0
  ) => {
    setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () => performanceService.measureApiCall(`prefetch-${key.join('-')}`, queryFn),
        ...CACHE_CONFIG,
      });
    }, delay);
  };
  
  const prefetchOnHover = (
    key: string[],
    queryFn: () => Promise<any>
  ) => ({
    onMouseEnter: () => prefetchQuery(key, queryFn, 100),
  });
  
  return { prefetchQuery, prefetchOnHover };
}