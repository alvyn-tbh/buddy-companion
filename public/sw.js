// Service Worker for AI Companion Chatbot
// Provides offline functionality, background sync, and intelligent caching

const CACHE_NAME = 'ai-companion-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Files to cache immediately (app shell)
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  // Core pages
  '/corporate',
  '/travel', 
  '/emotional',
  '/culture',
  // Static assets will be cached automatically by Next.js
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  /^\/api\/analytics/,
  /^\/api\/admin/,
];

// Background sync tags
const SYNC_TAGS = {
  CHAT_MESSAGE: 'chat-message-sync',
  ANALYTICS: 'analytics-sync',
  USAGE_TRACKING: 'usage-tracking-sync',
};

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] App shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache app shell:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticAssets(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(handleAssets(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Critical API endpoints - always try network first
  const isCritical = url.pathname.includes('/corporate') || 
                    url.pathname.includes('/transcribe') ||
                    url.pathname.includes('/tts');

  if (isCritical) {
    return handleNetworkFirst(request, API_CACHE);
  }

  // Non-critical API endpoints - cache first for performance
  return handleCacheFirst(request, API_CACHE);
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  return handleCacheFirst(request, STATIC_CACHE);
}

// Handle other assets with stale-while-revalidate
async function handleAssets(request) {
  return handleStaleWhileRevalidate(request, DYNAMIC_CACHE);
}

// Handle page requests with network-first fallback to cache
async function handlePageRequest(request) {
  return handleNetworkFirst(request, DYNAMIC_CACHE, '/offline');
}

// Network-first strategy
async function handleNetworkFirst(request, cacheName, fallbackUrl = null) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return fallback page if available
    if (fallbackUrl) {
      return caches.match(fallbackUrl);
    }
    
    throw error;
  }
}

// Cache-first strategy
async function handleCacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.CHAT_MESSAGE:
      event.waitUntil(syncChatMessages());
      break;
    case SYNC_TAGS.ANALYTICS:
      event.waitUntil(syncAnalytics());
      break;
    case SYNC_TAGS.USAGE_TRACKING:
      event.waitUntil(syncUsageTracking());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Sync queued chat messages when online
async function syncChatMessages() {
  try {
    const db = await openIndexedDB();
    const messages = await getQueuedMessages(db);
    
    for (const message of messages) {
      try {
        const response = await fetch('/api/corporate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message.data),
        });
        
        if (response.ok) {
          await removeQueuedMessage(db, message.id);
          console.log('[SW] Synced chat message:', message.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Chat sync failed:', error);
  }
}

// Sync analytics data
async function syncAnalytics() {
  try {
    const db = await openIndexedDB();
    const analytics = await getQueuedAnalytics(db);
    
    for (const item of analytics) {
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        
        if (response.ok) {
          await removeQueuedAnalytics(db, item.id);
          console.log('[SW] Synced analytics:', item.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error);
  }
}

// Sync usage tracking data
async function syncUsageTracking() {
  try {
    const db = await openIndexedDB();
    const usage = await getQueuedUsage(db);
    
    for (const item of usage) {
      try {
        const response = await fetch('/api/admin/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        
        if (response.ok) {
          await removeQueuedUsage(db, item.id);
          console.log('[SW] Synced usage data:', item.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync usage:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Usage sync failed:', error);
  }
}

// IndexedDB helper functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AI_COMPANION_DB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      // Create object stores for offline data
      if (!db.objectStoreNames.contains('queuedMessages')) {
        db.createObjectStore('queuedMessages', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('queuedAnalytics')) {
        db.createObjectStore('queuedAnalytics', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('queuedUsage')) {
        db.createObjectStore('queuedUsage', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getQueuedMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queuedMessages'], 'readonly');
    const store = transaction.objectStore('queuedMessages');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeQueuedMessage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queuedMessages'], 'readwrite');
    const store = transaction.objectStore('queuedMessages');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getQueuedAnalytics(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queuedAnalytics'], 'readonly');
    const store = transaction.objectStore('queuedAnalytics');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeQueuedAnalytics(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queuedAnalytics'], 'readwrite');
    const store = transaction.objectStore('queuedAnalytics');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getQueuedUsage(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queuedUsage'], 'readonly');
    const store = transaction.objectStore('queuedUsage');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeQueuedUsage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['queuedUsage'], 'readwrite');
    const store = transaction.objectStore('queuedUsage');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'QUEUE_CHAT_MESSAGE':
      queueChatMessage(data);
      break;
    case 'QUEUE_ANALYTICS':
      queueAnalytics(data);
      break;
    case 'QUEUE_USAGE':
      queueUsage(data);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Queue data for background sync
async function queueChatMessage(data) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['queuedMessages'], 'readwrite');
    const store = transaction.objectStore('queuedMessages');
    
    await store.add({
      data,
      timestamp: Date.now(),
    });
    
    // Register for background sync
    await self.registration.sync.register(SYNC_TAGS.CHAT_MESSAGE);
  } catch (error) {
    console.error('[SW] Failed to queue chat message:', error);
  }
}

async function queueAnalytics(data) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['queuedAnalytics'], 'readwrite');
    const store = transaction.objectStore('queuedAnalytics');
    
    await store.add({
      data,
      timestamp: Date.now(),
    });
    
    await self.registration.sync.register(SYNC_TAGS.ANALYTICS);
  } catch (error) {
    console.error('[SW] Failed to queue analytics:', error);
  }
}

async function queueUsage(data) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['queuedUsage'], 'readwrite');
    const store = transaction.objectStore('queuedUsage');
    
    await store.add({
      data,
      timestamp: Date.now(),
    });
    
    await self.registration.sync.register(SYNC_TAGS.USAGE_TRACKING);
  } catch (error) {
    console.error('[SW] Failed to queue usage data:', error);
  }
}

console.log('[SW] Service worker loaded successfully');