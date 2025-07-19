// Service Worker registration and management utilities

export interface SWRegistrationOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export interface PreloadOptions {
  routes?: string[];
  priority?: 'high' | 'low';
  delay?: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  /**
   * Register the service worker
   */
  async register(options: SWRegistrationOptions = {}): Promise<void> {
    if (!this.isSupported) {
      console.warn('[SW] Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration = registration;

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              options.onUpdate?.(registration);
            }
          });
        }
      });

      // Check for existing registration
      if (registration.active) {
        options.onSuccess?.(registration);
      }

      console.log('[SW] Service Worker registered successfully');
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
      options.onError?.(error as Error);
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.isSupported || !this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[SW] Service Worker unregistered');
      return result;
    } catch (error) {
      console.error('[SW] Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update the service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      console.warn('[SW] No registration found for update');
      return;
    }

    try {
      await this.registration.update();
      console.log('[SW] Service Worker update check completed');
    } catch (error) {
      console.error('[SW] Service Worker update failed:', error);
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  skipWaiting(): void {
    if (!this.registration?.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Send message to service worker
   */
  postMessage(message: any): void {
    if (!navigator.serviceWorker.controller) {
      console.warn('[SW] No active service worker to send message to');
      return;
    }

    navigator.serviceWorker.controller.postMessage(message);
  }

  /**
   * Queue data for background sync
   */
  queueForSync(type: string, data: any): void {
    this.postMessage({
      type: `QUEUE_${type.toUpperCase()}`,
      data,
    });
  }

  /**
   * Preload routes for better performance
   */
  async preloadRoutes(options: PreloadOptions = {}): Promise<void> {
    const {
      routes = ['/', '/corporate', '/travel', '/emotional', '/culture'],
      priority = 'low',
      delay = 2000,
    } = options;

    // Wait for initial page load
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const preloadPromises = routes.map(route => this.preloadRoute(route, priority));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log('[SW] Route preloading completed');
    } catch (error) {
      console.error('[SW] Route preloading failed:', error);
    }
  }

  /**
   * Preload a specific route
   */
  private async preloadRoute(route: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    try {
      // Use link preload for critical routes
      if (priority === 'high') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'fetch';
        link.href = route;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }

      // Fetch the route to cache it
      const response = await fetch(route, {
        method: 'GET',
        cache: 'force-cache',
      });

      if (response.ok) {
        console.log(`[SW] Preloaded route: ${route}`);
      }
    } catch (error) {
      console.warn(`[SW] Failed to preload route ${route}:`, error);
    }
  }

  /**
   * Check if the app is running in standalone mode (installed PWA)
   */
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Get network status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen for network status changes
   */
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[SW] All caches cleared');
    } catch (error) {
      console.error('[SW] Failed to clear caches:', error);
    }
  }

  /**
   * Get cache usage information
   */
  async getCacheUsage(): Promise<{ used: number; quota: number } | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    } catch (error) {
      console.error('[SW] Failed to get cache usage:', error);
      return null;
    }
  }
}

// Singleton instance
let swManager: ServiceWorkerManager | null = null;

export function getServiceWorkerManager(): ServiceWorkerManager {
  if (!swManager) {
    swManager = new ServiceWorkerManager();
  }
  return swManager;
}

/**
 * Initialize service worker with intelligent preloading
 */
export async function initializeServiceWorker(options: SWRegistrationOptions = {}): Promise<void> {
  const manager = getServiceWorkerManager();

  // Register service worker
  await manager.register({
    onUpdate: (registration) => {
      console.log('[SW] New version available');
      options.onUpdate?.(registration);
      
      // Show update notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('App Update Available', {
          body: 'A new version of the app is available. Refresh to update.',
          icon: '/icons/icon-192x192.png',
          tag: 'app-update',
        });
      }
    },
    onSuccess: (registration) => {
      console.log('[SW] Service Worker ready');
      options.onSuccess?.(registration);
    },
    onError: options.onError,
  });

  // Start intelligent route preloading
  setTimeout(() => {
    manager.preloadRoutes({
      priority: 'low',
      delay: 1000,
    });
  }, 3000);

  // Monitor network status
  manager.onNetworkChange((isOnline) => {
    console.log(`[SW] Network status: ${isOnline ? 'online' : 'offline'}`);
    
    if (isOnline) {
      // Trigger background sync when coming back online
      manager.postMessage({ type: 'SYNC_ALL' });
    }
  });
}

/**
 * Queue data for offline sync
 */
export function queueOfflineData(type: 'CHAT_MESSAGE' | 'ANALYTICS' | 'USAGE', data: any): void {
  const manager = getServiceWorkerManager();
  manager.queueForSync(type, data);
}

/**
 * Force update service worker
 */
export function updateServiceWorker(): void {
  const manager = getServiceWorkerManager();
  manager.skipWaiting();
  window.location.reload();
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Prompt PWA installation
 */
export async function promptPWAInstall(): Promise<boolean> {
  // This requires the beforeinstallprompt event to be captured
  // Implementation would depend on the specific PWA installation flow
  console.log('[SW] PWA installation prompt requested');
  return false;
}

export default ServiceWorkerManager;