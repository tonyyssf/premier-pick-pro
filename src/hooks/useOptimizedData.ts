import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

// Local storage cache for API responses
const localStorageCache = {
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`plpe_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  },

  get: (key: string) => {
    try {
      const item = localStorage.getItem(`plpe_cache_${key}`);
      if (!item) return null;

      const { data, timestamp, ttl } = JSON.parse(item);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`plpe_cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  },

  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('plpe_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};

// Deduplicated fetch function
export const deduplicatedFetch = async <T>(
  url: string, 
  options?: RequestInit,
  cacheKey?: string
): Promise<T> => {
  const fullCacheKey = cacheKey || `${url}-${JSON.stringify(options)}`;
  
  // Check request cache first
  if (requestCache.has(fullCacheKey)) {
    return requestCache.get(fullCacheKey) as Promise<T>;
  }
  
  // Check localStorage cache
  const cachedData = localStorageCache.get(fullCacheKey);
  if (cachedData) {
    return cachedData as T;
  }
  
  // Make the request
  const promise = fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      localStorageCache.set(fullCacheKey, data, 5 * 60 * 1000); // 5 minutes
      
      return data;
    })
    .catch((error) => {
      // Remove from request cache on error
      requestCache.delete(fullCacheKey);
      throw error;
    });
  
  // Store in request cache
  requestCache.set(fullCacheKey, promise);
  
  try {
    const result = await promise;
    requestCache.delete(fullCacheKey);
    return result;
  } catch (error) {
    requestCache.delete(fullCacheKey);
    throw error;
  }
};

// Retry logic for failed requests
export const retryRequest = async <T>(
  fn: () => Promise<T>, 
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
};

// Optimized hook for data fetching
export const useOptimizedData = <T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    retries?: number;
    cacheKey?: string;
    enabled?: boolean;
  }
) => {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000,   // 10 minutes
    retries = 3,
    cacheKey,
    enabled = true,
  } = options || {};

  const queryClient = useQueryClient();

  // Memoized fetch function with retry logic
  const memoizedFetchFn = useCallback(async () => {
    return retryRequest(async () => {
      const result = await fetchFn();
      
      // Cache the result with the provided cache key
      if (cacheKey) {
        localStorageCache.set(cacheKey, result, staleTime);
      }
      
      return result;
    }, retries);
  }, [fetchFn, retries, cacheKey, staleTime]);

  // Check cache first
  const cachedData = useMemo(() => {
    if (!cacheKey) return null;
    return localStorageCache.get(cacheKey);
  }, [cacheKey]);

  const query = useQuery({
    queryKey,
    queryFn: memoizedFetchFn,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: enabled && !cachedData, // Don't fetch if we have cached data
    initialData: cachedData, // Use cached data as initial data
  });

  // Optimized refetch function
  const optimizedRefetch = useCallback(async () => {
    // Clear cache before refetching
    if (cacheKey) {
      localStorageCache.set(cacheKey, null, 0);
    }
    
    return query.refetch();
  }, [query, cacheKey]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (cacheKey) {
      localStorageCache.set(cacheKey, null, 0);
    }
    queryClient.invalidateQueries({ queryKey });
  }, [cacheKey, queryClient, queryKey]);

  return {
    ...query,
    refetch: optimizedRefetch,
    clearCache,
    cachedData,
  };
};

// Hook for managing multiple related queries
export const useOptimizedQueries = <T extends Record<string, any>>(
  queries: {
    [K in keyof T]: {
      queryKey: string[];
      fetchFn: () => Promise<T[K]>;
      options?: Parameters<typeof useOptimizedData>[2];
    };
  }
) => {
  const results = {} as {
    [K in keyof T]: ReturnType<typeof useOptimizedData<T[K]>>;
  };

  // Create individual queries
  (Object.keys(queries) as (keyof T)[]).forEach((key) => {
    const { queryKey, fetchFn, options } = queries[key];
    results[key] = useOptimizedData(queryKey, fetchFn, options);
  });

  // Aggregate loading and error states
  const isLoading = Object.values(results).some(result => result.isLoading);
  const isError = Object.values(results).some(result => result.isError);
  const error = Object.values(results).find(result => result.error)?.error;

  // Refetch all queries
  const refetchAll = useCallback(async () => {
    const promises = Object.values(results).map(result => result.refetch());
    return Promise.all(promises);
  }, [results]);

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    Object.values(results).forEach(result => result.clearCache());
  }, [results]);

  return {
    results,
    isLoading,
    isError,
    error,
    refetchAll,
    clearAllCaches,
  };
};

// Export cache utilities for manual cache management
export { localStorageCache }; 