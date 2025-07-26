import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheConfig {
  name: string;
  version: number;
  stores: {
    [key: string]: {
      keyPath: string;
      indexes?: Array<{
        name: string;
        keyPath: string;
        options?: IDBIndexParameters;
      }>;
    };
  };
}

interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
  version: number;
}

interface CacheStats {
  totalItems: number;
  totalSize: number;
  oldestItem: number;
  newestItem: number;
  expiredItems: number;
}

export const useAdvancedCache = (config: CacheConfig) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  // Initialize IndexedDB
  const initializeDB = useCallback(async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(config.name, config.version);

      request.onerror = () => {
        setError('Failed to open IndexedDB');
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        const db = request.result;
        dbRef.current = db;
        setIsReady(true);
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        Object.entries(config.stores).forEach(([storeName, storeConfig]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const objectStore = db.createObjectStore(storeName, {
              keyPath: storeConfig.keyPath,
            });

            // Create indexes
            storeConfig.indexes?.forEach((index) => {
              objectStore.createIndex(index.name, index.keyPath, index.options);
            });
          }
        });
      };
    });
  }, [config]);

  // Get item from cache
  const get = useCallback(async <T>(storeName: string, key: string): Promise<T | null> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const item: CacheItem<T> | undefined = request.result;
        
        if (!item) {
          resolve(null);
          return;
        }

        // Check if item is expired
        if (item.expiresAt && Date.now() > item.expiresAt) {
          // Remove expired item
          remove(storeName, key);
          resolve(null);
          return;
        }

        resolve(item.data);
      };

      request.onerror = () => {
        reject(new Error('Failed to get item from cache'));
      };
    });
  }, [initializeDB]);

  // Set item in cache
  const set = useCallback(async <T>(
    storeName: string, 
    key: string, 
    data: T, 
    options?: { 
      ttl?: number; // Time to live in milliseconds
      version?: number;
    }
  ): Promise<void> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const item: CacheItem<T> = {
        key,
        data,
        timestamp: Date.now(),
        version: options?.version || 1,
      };

      if (options?.ttl) {
        item.expiresAt = Date.now() + options.ttl;
      }

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to set item in cache'));
    });
  }, [initializeDB]);

  // Remove item from cache
  const remove = useCallback(async (storeName: string, key: string): Promise<void> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove item from cache'));
    });
  }, [initializeDB]);

  // Clear all items from a store
  const clear = useCallback(async (storeName: string): Promise<void> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear store'));
    });
  }, [initializeDB]);

  // Get all items from a store
  const getAll = useCallback(async <T>(storeName: string): Promise<T[]> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: CacheItem<T>[] = request.result;
        const now = Date.now();
        
        // Filter out expired items
        const validItems = items.filter(item => 
          !item.expiresAt || now <= item.expiresAt
        );

        resolve(validItems.map(item => item.data));
      };

      request.onerror = () => reject(new Error('Failed to get all items from cache'));
    });
  }, [initializeDB]);

  // Get cache statistics
  const getStats = useCallback(async (storeName: string): Promise<CacheStats> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: CacheItem[] = request.result;
        const now = Date.now();

        const validItems = items.filter(item => 
          !item.expiresAt || now <= item.expiresAt
        );

        const expiredItems = items.length - validItems.length;
        const timestamps = validItems.map(item => item.timestamp);

        const stats: CacheStats = {
          totalItems: validItems.length,
          totalSize: JSON.stringify(validItems).length,
          oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
          newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0,
          expiredItems,
        };

        resolve(stats);
      };

      request.onerror = () => reject(new Error('Failed to get cache stats'));
    });
  }, [initializeDB]);

  // Clean up expired items
  const cleanup = useCallback(async (storeName: string): Promise<number> => {
    if (!dbRef.current) {
      await initializeDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: CacheItem[] = request.result;
        const now = Date.now();
        let removedCount = 0;

        items.forEach(item => {
          if (item.expiresAt && now > item.expiresAt) {
            store.delete(item.key);
            removedCount++;
          }
        });

        resolve(removedCount);
      };

      request.onerror = () => reject(new Error('Failed to cleanup cache'));
    });
  }, [initializeDB]);

  // Preload data with intelligent caching
  const preload = useCallback(async <T>(
    storeName: string,
    key: string,
    fetchFn: () => Promise<T>,
    options?: {
      ttl?: number;
      forceRefresh?: boolean;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T> => {
    try {
      // Check cache first (unless force refresh)
      if (!options?.forceRefresh) {
        const cached = await get<T>(storeName, key);
        if (cached !== null) {
          options?.onSuccess?.(cached);
          return cached;
        }
      }

      // Fetch fresh data
      const data = await fetchFn();
      
      // Cache the data
      await set(storeName, key, data, { ttl: options?.ttl });
      
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      options?.onError?.(err);
      throw err;
    }
  }, [get, set]);

  // Initialize on mount
  useEffect(() => {
    initializeDB().catch((err) => {
      setError(err.message);
    });
  }, [initializeDB]);

  return {
    isReady,
    error,
    get,
    set,
    remove,
    clear,
    getAll,
    getStats,
    cleanup,
    preload,
  };
}; 