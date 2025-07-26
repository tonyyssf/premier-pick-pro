const CACHE_VERSION = 'v2';
const STATIC_CACHE = `plpe-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `plpe-dynamic-${CACHE_VERSION}`;
const API_CACHE = `plpe-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `plpe-images-${CACHE_VERSION}`;

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
  '/manifest.json',
  '/offline.html'
];

// API endpoints with different caching strategies
const API_ENDPOINTS = {
  '/api/standings': { strategy: 'network-first', ttl: 5 * 60 * 1000 }, // 5 minutes
  '/api/fixtures': { strategy: 'network-first', ttl: 10 * 60 * 1000 }, // 10 minutes
  '/api/gameweeks': { strategy: 'cache-first', ttl: 60 * 60 * 1000 }, // 1 hour
  '/api/leagues': { strategy: 'stale-while-revalidate', ttl: 30 * 60 * 1000 }, // 30 minutes
};

// Background sync tags
const SYNC_TAGS = {
  PICK_SUBMISSION: 'pick-submission',
  PROFILE_UPDATE: 'profile-update',
  LEAGUE_JOIN: 'league-join',
  DATA_SYNC: 'data-sync'
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing advanced version...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      
      // Preload important resources
      preloadImportantResources(),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ]).catch(error => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating advanced version...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),
      
      // Claim all clients immediately
      self.clients.claim(),
      
      // Initialize background sync
      initializeBackgroundSync()
    ]).then(() => {
      console.log('Service Worker: Advanced version activated');
    })
  );
});

// Fetch event - enhanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (handle in background sync)
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleExternalRequest(request));
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.PICK_SUBMISSION:
      event.waitUntil(handlePickSubmission());
      break;
    case SYNC_TAGS.PROFILE_UPDATE:
      event.waitUntil(handleProfileUpdate());
      break;
    case SYNC_TAGS.LEAGUE_JOIN:
      event.waitUntil(handleLeagueJoin());
      break;
    case SYNC_TAGS.DATA_SYNC:
      event.waitUntil(handleDataSync());
      break;
    default:
      console.log('Service Worker: Unknown sync tag:', event.tag);
  }
});

// Periodic sync event (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'data-refresh') {
    event.waitUntil(refreshDataPeriodically());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from PLPE',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: true,
    tag: 'plpe-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('PLPE Update', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_API_RESPONSE':
      cacheApiResponse(data.url, data.response);
      break;
      
    case 'REGISTER_BACKGROUND_SYNC':
      registerBackgroundSync(data.tag, data.options);
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// Enhanced API request handling with different strategies
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const endpoint = url.pathname;
  const config = API_ENDPOINTS[endpoint] || { strategy: 'network-first', ttl: 5 * 60 * 1000 };
  
  switch (config.strategy) {
    case 'network-first':
      return handleNetworkFirst(request, config.ttl);
    case 'cache-first':
      return handleCacheFirst(request, config.ttl);
    case 'stale-while-revalidate':
      return handleStaleWhileRevalidate(request, config.ttl);
    default:
      return handleNetworkFirst(request, config.ttl);
  }
}

// Network-first strategy
async function handleNetworkFirst(request, ttl) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      const responseClone = networkResponse.clone();
      
      // Cache with TTL
      cache.put(request, responseClone).then(() => {
        setTimeout(() => cache.delete(request), ttl);
      });
      
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy
async function handleCacheFirst(request, ttl) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(API_CACHE);
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone).then(() => {
          setTimeout(() => cache.delete(request), ttl);
        });
      }
    }).catch(() => {
      // Ignore fetch errors in background
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).then(() => {
        setTimeout(() => cache.delete(request), ttl);
      });
    }
    
    return networkResponse;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request, ttl) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached response immediately if available
  const responsePromise = cachedResponse ? Promise.resolve(cachedResponse) : fetch(request);
  
  // Update cache in background
  fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).then(() => {
        setTimeout(() => cache.delete(request), ttl);
      });
    }
  }).catch(() => {
    // Ignore fetch errors in background
  });
  
  return responsePromise;
}

// Image request handling with optimization
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return cache.match('/placeholder.svg');
  }
}

// Static request handling
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return cache.match('/offline.html');
    }
    
    throw error;
  }
}

// External request handling
async function handleExternalRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync handlers
async function handlePickSubmission() {
  const pendingPicks = await getPendingActions('picks');
  
  for (const pick of pendingPicks) {
    try {
      await submitPick(pick);
      await removePendingAction('picks', pick.id);
    } catch (error) {
      console.error('Failed to submit pick:', error);
    }
  }
}

async function handleProfileUpdate() {
  const pendingUpdates = await getPendingActions('profile');
  
  for (const update of pendingUpdates) {
    try {
      await updateProfile(update);
      await removePendingAction('profile', update.id);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }
}

async function handleLeagueJoin() {
  const pendingJoins = await getPendingActions('league');
  
  for (const join of pendingJoins) {
    try {
      await joinLeague(join);
      await removePendingAction('league', join.id);
    } catch (error) {
      console.error('Failed to join league:', error);
    }
  }
}

async function handleDataSync() {
  try {
    // Sync standings data
    await syncStandings();
    
    // Sync fixtures data
    await syncFixtures();
    
    // Sync user data
    await syncUserData();
    
    console.log('Service Worker: Data sync completed');
  } catch (error) {
    console.error('Service Worker: Data sync failed:', error);
  }
}

// Periodic data refresh
async function refreshDataPeriodically() {
  console.log('Service Worker: Periodic data refresh');
  
  try {
    // Refresh cached data
    await refreshCachedData();
    
    // Update notifications
    await updateNotifications();
    
    console.log('Service Worker: Periodic refresh completed');
  } catch (error) {
    console.error('Service Worker: Periodic refresh failed:', error);
  }
}

// Utility functions
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i);
}

async function preloadImportantResources() {
  const importantResources = [
    '/api/standings',
    '/api/fixtures',
    '/api/gameweeks'
  ];
  
  const cache = await caches.open(API_CACHE);
  
  for (const resource of importantResources) {
    try {
      const response = await fetch(resource);
      if (response.ok) {
        cache.put(resource, response);
      }
    } catch (error) {
      console.warn('Failed to preload resource:', resource);
    }
  }
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!cacheName.startsWith('plpe-') || 
          (cacheName !== STATIC_CACHE && 
           cacheName !== DYNAMIC_CACHE && 
           cacheName !== API_CACHE && 
           cacheName !== IMAGE_CACHE)) {
        console.log('Service Worker: Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

async function initializeBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    console.log('Service Worker: Background sync supported');
  } else {
    console.log('Service Worker: Background sync not supported');
  }
}

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = {
      size: keys.length,
      urls: keys.map(req => req.url)
    };
  }
  
  return stats;
}

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

// IndexedDB operations (simplified)
async function getPendingActions(type) {
  // This would use IndexedDB to get pending actions
  return [];
}

async function removePendingAction(type, id) {
  // This would use IndexedDB to remove pending actions
  console.log('Removing pending action:', type, id);
}

// API operations (simplified)
async function submitPick(pick) {
  console.log('Submitting pick:', pick);
}

async function updateProfile(update) {
  console.log('Updating profile:', update);
}

async function joinLeague(join) {
  console.log('Joining league:', join);
}

async function syncStandings() {
  console.log('Syncing standings');
}

async function syncFixtures() {
  console.log('Syncing fixtures');
}

async function syncUserData() {
  console.log('Syncing user data');
}

async function refreshCachedData() {
  console.log('Refreshing cached data');
}

async function updateNotifications() {
  console.log('Updating notifications');
} 