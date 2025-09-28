/**
 * Performance utilities for optimizing React applications
 */

// Lazy loading utility for components
export const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });
};

// Memoization utility for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

// Throttle utility for limiting function calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>): ReturnType<T> | void => {
    if (!inThrottle) {
      const result = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      return result;
    }
  }) as T;
};

// Debounce utility for delaying function execution
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Performance measurement utility
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  
  static mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.marks.set(name, window.performance.now());
    }
  }
  
  static measure(name: string, startMark: string): number | null {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.marks.get(startMark);
      if (startTime) {
        const duration = window.performance.now() - startTime;
        console.log(`${name}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    }
    return null;
  }
  
  static clearMarks(): void {
    this.marks.clear();
  }
}

// Image optimization utility
export const optimizeImage = (
  src: string,
  width?: number,
  height?: number,
  quality: number = 75
): string => {
  if (!src) return '';
  
  // For Next.js Image optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  
  return `${src}?${params.toString()}`;
};

// Bundle size analyzer utility
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((total, script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('_next/static')) {
        // Estimate size based on script length (rough approximation)
        return total + src.length;
      }
      return total;
    }, 0);
    
    console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  }
  return null;
};

// Preload utility for critical resources
export const preloadResource = (href: string, as: string, type?: string) => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  }
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string) => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

import React from 'react';