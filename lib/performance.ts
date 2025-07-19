// Performance monitoring utilities for Core Web Vitals and optimization metrics
import React from 'react';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  id?: string;
}

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          if (lastEntry) {
            this.recordMetric({
              name: 'LCP',
              value: lastEntry.startTime,
              timestamp: Date.now(),
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.recordMetric({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
            });
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.recordMetric({
                name: 'CLS',
                value: clsValue,
                timestamp: Date.now(),
              });
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Navigation timing
      this.recordNavigationMetrics();
    }
  }

  private recordNavigationMetrics() {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        
        // Time to First Byte
        this.recordMetric({
          name: 'TTFB',
          value: entry.responseStart - entry.requestStart,
          timestamp: Date.now(),
        });

        // First Contentful Paint (will be overridden by paint observer if available)
        setTimeout(() => {
          const paintEntries = window.performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          
          if (fcpEntry) {
            this.recordMetric({
              name: 'FCP',
              value: fcpEntry.startTime,
              timestamp: Date.now(),
            });
          }
        }, 0);
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.set(metric.name, metric);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        custom_parameter: metric.name,
        value: Math.round(metric.value),
      });
    }
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): CoreWebVitals {
    return {
      lcp: this.metrics.get('LCP')?.value,
      fid: this.metrics.get('FID')?.value,
      cls: this.metrics.get('CLS')?.value,
      fcp: this.metrics.get('FCP')?.value,
      ttfb: this.metrics.get('TTFB')?.value,
    };
  }

  // Custom timing utilities
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric({
        name: `custom_${name}`,
        value: endTime - startTime,
        timestamp: Date.now(),
      });
    };
  }

  // Bundle size tracking
  trackBundleLoad(bundleName: string, size: number) {
    this.recordMetric({
      name: `bundle_${bundleName}`,
      value: size,
      timestamp: Date.now(),
    });
  }

  // Clean up observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

// Utility function to measure React component render time
export function measureComponentRender<T extends any[]>(
  componentName: string,
  renderFn: (...args: T) => any
) {
  return (...args: T) => {
    const monitor = getPerformanceMonitor();
    const endTiming = monitor.startTiming(`${componentName}_render`);
    
    try {
      const result = renderFn(...args);
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  };
}

// HOC for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const MemoizedComponent = React.memo(WrappedComponent);
  
  return React.forwardRef<any, P>((props, ref) => {
    const monitor = getPerformanceMonitor();
    const endTiming = monitor.startTiming(`${componentName}_render`);
    
    React.useEffect(() => {
      endTiming();
    });

    return React.createElement(MemoizedComponent, { ...props, ref });
  });
}

// Hook for tracking custom performance metrics
export function usePerformanceMetric(metricName: string) {
  const monitor = getPerformanceMonitor();
  
  return {
    start: () => monitor.startTiming(metricName),
    record: (value: number) => monitor.recordMetric({
      name: metricName,
      value,
      timestamp: Date.now(),
    }),
    get: () => monitor.getMetric(metricName),
  };
}

export default PerformanceMonitor;