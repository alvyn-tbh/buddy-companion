'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { initializeServiceWorker, getServiceWorkerManager, updateServiceWorker } from '@/lib/service-worker';
import { getPerformanceMonitor } from '@/lib/performance';

interface ServiceWorkerContextType {
  isSupported: boolean;
  isRegistered: boolean;
  hasUpdate: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  updateAvailable: () => void;
  queueOfflineData: (type: string, data: any) => void;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType | null>(null);

export function useServiceWorker() {
  const context = useContext(ServiceWorkerContext);
  if (!context) {
    throw new Error('useServiceWorker must be used within ServiceWorkerProvider');
  }
  return context;
}

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    const performanceMonitor = getPerformanceMonitor();
    
    // Check support
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    // Check online status
    setIsOnline(navigator.onLine);
    
    // Check standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (!supported) {
      console.warn('[SW] Service Worker not supported');
      return;
    }

    // Initialize service worker
    initializeServiceWorker({
      onSuccess: (registration) => {
        setIsRegistered(true);
        console.log('[SW] Service Worker registered successfully');
        
        // Track successful registration
        performanceMonitor.recordMetric({
          name: 'sw_registration_success',
          value: 1,
          timestamp: Date.now(),
        });
      },
      onUpdate: (registration) => {
        setHasUpdate(true);
        console.log('[SW] Service Worker update available');
        
        // Show update notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('App Update Available', {
            body: 'A new version is available. Click to update.',
            icon: '/icons/icon-192x192.png',
            tag: 'app-update',
            badge: '/icons/icon-96x96.png',
            actions: [
              {
                action: 'update',
                title: 'Update Now',
              },
              {
                action: 'dismiss',
                title: 'Later',
              }
            ],
          });
          
          notification.onclick = () => {
            updateServiceWorker();
            notification.close();
          };
        }
      },
      onError: (error) => {
        console.error('[SW] Service Worker registration failed:', error);
        
        // Track registration errors
        performanceMonitor.recordMetric({
          name: 'sw_registration_error',
          value: 1,
          timestamp: Date.now(),
        });
      },
    });

    // Monitor network status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[SW] Network: Online');
      
      // Trigger background sync when coming back online
      const manager = getServiceWorkerManager();
      manager.postMessage({ type: 'SYNC_ALL' });
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[SW] Network: Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('[SW] Notification permission:', permission);
      });
    }

    // Handle PWA installation prompt
    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[SW] PWA installation prompt available');
      
      // Show custom install button or banner
      // You can implement a custom UI here
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle PWA installation
    const handleAppInstalled = () => {
      console.log('[SW] PWA installed successfully');
      deferredPrompt = null;
      
      // Track installation
      performanceMonitor.recordMetric({
        name: 'pwa_install_success',
        value: 1,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Handle service worker messages
    const handleMessage = (event: MessageEvent) => {
      const { data } = event;
      
      if (data && data.type) {
        switch (data.type) {
          case 'SW_UPDATE_AVAILABLE':
            setHasUpdate(true);
            break;
          case 'SW_UPDATED':
            window.location.reload();
            break;
          default:
            console.log('[SW] Unknown message:', data);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const updateAvailable = () => {
    updateServiceWorker();
  };

  const queueOfflineData = (type: string, data: any) => {
    const manager = getServiceWorkerManager();
    manager.queueForSync(type, data);
  };

  const contextValue: ServiceWorkerContextType = {
    isSupported,
    isRegistered,
    hasUpdate,
    isOnline,
    isStandalone,
    updateAvailable,
    queueOfflineData,
  };

  return (
    <ServiceWorkerContext.Provider value={contextValue}>
      {children}
      
      {/* Update notification banner */}
      {hasUpdate && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">
                  App update available
                </p>
                <p className="text-xs opacity-90">
                  A new version with improvements is ready
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={updateAvailable}
                className="bg-white text-indigo-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => setHasUpdate(false)}
                className="text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-sm">You're offline</span>
          </div>
        </div>
      )}
    </ServiceWorkerContext.Provider>
  );
}