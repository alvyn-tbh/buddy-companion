// Custom image loader for CDN integration and optimization

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export interface CDNConfig {
  baseUrl?: string;
  enabled?: boolean;
  formats?: string[];
  quality?: number;
}

// CDN configuration - can be updated when CDN is ready
const CDN_CONFIG: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  enabled: process.env.NEXT_PUBLIC_CDN_ENABLED === 'true',
  formats: ['webp', 'avif', 'jpg'],
  quality: 75,
};

/**
 * Custom image loader with CDN support and optimization
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If CDN is not enabled, return original src with optimization params
  if (!CDN_CONFIG.enabled || !CDN_CONFIG.baseUrl) {
    return optimizeLocalImage(src, width, quality);
  }

  // Use CDN for image optimization
  return optimizeCDNImage(src, width, quality);
}

/**
 * Optimize images locally using Next.js built-in optimization
 */
function optimizeLocalImage(src: string, width: number, quality?: number): string {
  const params = new URLSearchParams();
  
  // Add width parameter
  params.set('w', width.toString());
  
  // Add quality parameter
  if (quality) {
    params.set('q', quality.toString());
  }
  
  // For external URLs, return as-is with a fallback
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local images, use Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
}

/**
 * Optimize images using external CDN
 */
function optimizeCDNImage(src: string, width: number, quality?: number): string {
  const { baseUrl } = CDN_CONFIG;
  const params = new URLSearchParams();
  
  // Add optimization parameters
  params.set('w', width.toString());
  params.set('q', (quality || CDN_CONFIG.quality || 75).toString());
  params.set('f', 'auto'); // Auto format selection
  params.set('fit', 'cover');
  
  // Handle different src types
  let imagePath = src;
  
  // Remove leading slash for CDN
  if (imagePath.startsWith('/')) {
    imagePath = imagePath.slice(1);
  }
  
  // For external URLs, encode them
  if (src.startsWith('http')) {
    imagePath = encodeURIComponent(src);
    params.set('url', imagePath);
    return `${baseUrl}/fetch/?${params.toString()}`;
  }
  
  // For local images, construct CDN URL
  return `${baseUrl}/${imagePath}?${params.toString()}`;
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function generateResponsiveUrls(
  src: string, 
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality?: number
): { src: string; width: number }[] {
  return sizes.map(width => ({
    src: imageLoader({ src, width, quality }),
    width,
  }));
}

/**
 * Generate image srcSet for responsive images
 */
export function generateSrcSet(
  src: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality?: number
): string {
  const urls = generateResponsiveUrls(src, sizes, quality);
  return urls.map(({ src, width }) => `${src} ${width}w`).join(', ');
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, width: number, quality?: number): void {
  if (typeof window === 'undefined') return;
  
  const optimizedSrc = imageLoader({ src, width, quality });
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedSrc;
  link.fetchPriority = 'high';
  
  document.head.appendChild(link);
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(
  element: HTMLImageElement,
  src: string,
  width: number,
  quality?: number
): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    element.src = imageLoader({ src, width, quality });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = imageLoader({ src, width, quality });
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  observer.observe(element);
}

/**
 * Get optimized image metadata
 */
export function getImageMetadata(src: string): {
  isExternal: boolean;
  isOptimized: boolean;
  format: string;
} {
  const isExternal = src.startsWith('http');
  const isOptimized = CDN_CONFIG.enabled || !isExternal;
  const format = getImageFormat(src);
  
  return {
    isExternal,
    isOptimized,
    format,
  };
}

/**
 * Extract image format from src
 */
function getImageFormat(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    case 'svg':
      return 'svg';
    default:
      return 'unknown';
  }
}

/**
 * Convert image to WebP format if supported
 */
export function getWebPUrl(src: string, width: number, quality?: number): string {
  if (!supportsWebP()) {
    return imageLoader({ src, width, quality });
  }
  
  // Add WebP format parameter for CDN
  if (CDN_CONFIG.enabled && CDN_CONFIG.baseUrl) {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('q', (quality || 75).toString());
    params.set('f', 'webp');
    
    let imagePath = src.startsWith('/') ? src.slice(1) : src;
    return `${CDN_CONFIG.baseUrl}/${imagePath}?${params.toString()}`;
  }
  
  return imageLoader({ src, width, quality });
}

/**
 * Check WebP support
 */
function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Image optimization utilities
 */
export const ImageUtils = {
  loader: imageLoader,
  generateResponsiveUrls,
  generateSrcSet,
  preloadImage,
  lazyLoadImage,
  getImageMetadata,
  getWebPUrl,
  supportsWebP,
};

// Performance monitoring for images
export function trackImagePerformance(src: string, startTime: number): void {
  if (typeof window === 'undefined' || !window.performance) return;
  
  const endTime = performance.now();
  const loadTime = endTime - startTime;
  
  // Send to analytics if available
  if ((window as any).gtag) {
    (window as any).gtag('event', 'image_load_time', {
      custom_parameter: src,
      value: Math.round(loadTime),
    });
  }
  
  console.log(`[Image] Loaded ${src} in ${loadTime.toFixed(2)}ms`);
}

/**
 * Batch preload images
 */
export function preloadImages(
  images: { src: string; width: number; quality?: number }[]
): void {
  images.forEach(({ src, width, quality }) => {
    preloadImage(src, width, quality);
  });
}

/**
 * Get optimal image size based on device
 */
export function getOptimalImageSize(containerWidth: number): number {
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const sizes = [640, 750, 828, 1080, 1200, 1920, 2048];
  
  const targetWidth = containerWidth * devicePixelRatio;
  
  // Find the smallest size that's larger than the target
  const optimalSize = sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];
  
  return optimalSize;
}