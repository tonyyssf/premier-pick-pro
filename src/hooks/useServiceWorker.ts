import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  isControlling: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalled: false,
    isControlling: false,
    hasUpdate: false,
    registration: null,
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      console.log('Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for updates
      });

      console.log('Service Worker registered:', registration);

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, [state.isSupported]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update check failed:', error);
    }
  }, [state.registration]);

  // Skip waiting and reload
  const skipWaiting = useCallback(async () => {
    if (!state.registration || !state.registration.waiting) {
      return;
    }

    try {
      // Send skip waiting message to service worker
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to skip waiting:', error);
    }
  }, [state.registration]);

  // Unregister service worker
  const unregisterServiceWorker = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        isInstalled: false,
        isControlling: false,
        registration: null,
      }));
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
    }
  }, [state.registration]);

  // Cache API response
  const cacheApiResponse = useCallback(async (url: string, response: Response) => {
    if (!state.registration || !state.registration.active) return;

    try {
      state.registration.active.postMessage({
        type: 'CACHE_API_RESPONSE',
        url,
        response: response.clone(),
      });
    } catch (error) {
      console.error('Failed to cache API response:', error);
    }
  }, [state.registration]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  // Send push notification
  const sendPushNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!state.registration) return;

    try {
      await state.registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        ...options,
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }, [state.registration]);

  // Get cache info
  const getCacheInfo = useCallback(async () => {
    if (!state.registration) return null;

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            size: keys.length,
            urls: keys.map(req => req.url),
          };
        })
      );

      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return null;
    }
  }, [state.registration]);

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }, []);

  useEffect(() => {
    if (!state.isSupported) return;

    // Register service worker on mount
    registerServiceWorker();

    // Listen for service worker updates
    const handleUpdateFound = () => {
      const registration = state.registration;
      if (!registration) return;

      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New service worker is available
            setUpdateAvailable(true);
            setState(prev => ({ ...prev, hasUpdate: true }));
          } else {
            // Service worker is controlling the page for the first time
            setState(prev => ({ ...prev, isControlling: true }));
          }
        }
      });
    };

    // Listen for controller change
    const handleControllerChange = () => {
      setState(prev => ({
        ...prev,
        isControlling: !!navigator.serviceWorker.controller,
      }));
    };

    // Set up event listeners
    if (state.registration) {
      state.registration.addEventListener('updatefound', handleUpdateFound);
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    // Check if service worker is already controlling
    setState(prev => ({
      ...prev,
      isControlling: !!navigator.serviceWorker.controller,
    }));

    return () => {
      if (state.registration) {
        state.registration.removeEventListener('updatefound', handleUpdateFound);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, [state.isSupported, state.registration, registerServiceWorker]);

  return {
    ...state,
    updateAvailable,
    registerServiceWorker,
    checkForUpdates,
    skipWaiting,
    unregisterServiceWorker,
    cacheApiResponse,
    requestNotificationPermission,
    sendPushNotification,
    getCacheInfo,
    clearAllCaches,
  };
}; 