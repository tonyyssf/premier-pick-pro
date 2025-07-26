interface CDNConfig {
  baseUrl: string;
  imageOptimization: {
    enabled: boolean;
    formats: string[];
    quality: number;
    breakpoints: number[];
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
  regions: string[];
}

interface OptimizedAsset {
  originalUrl: string;
  optimizedUrl: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

class CDNService {
  private config: CDNConfig;
  private cache: Map<string, OptimizedAsset> = new Map();

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Get the nearest CDN region based on user location
  private getNearestRegion(): string {
    // In a real implementation, this would use geolocation or IP-based detection
    // For now, return the first region
    return this.config.regions[0] || 'us-east-1';
  }

  // Generate optimized image URL
  optimizeImage(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      format?: string;
      quality?: number;
      fit?: 'cover' | 'contain' | 'fill';
    } = {}
  ): string {
    if (!this.config.imageOptimization.enabled) {
      return originalUrl;
    }

    const region = this.getNearestRegion();
    const format = options.format || 'webp';
    const quality = options.quality || this.config.imageOptimization.quality;
    const width = options.width;
    const height = options.height;
    const fit = options.fit || 'cover';

    // Build optimization parameters
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (format !== 'original') params.append('f', format);
    params.append('q', quality.toString());
    params.append('fit', fit);

    // Generate optimized URL
    const optimizedUrl = `${this.config.baseUrl}/${region}/optimize?${params.toString()}&url=${encodeURIComponent(originalUrl)}`;
    
    return optimizedUrl;
  }

  // Generate responsive image srcset
  generateSrcSet(
    originalUrl: string,
    options: {
      formats?: string[];
      breakpoints?: number[];
      quality?: number;
    } = {}
  ): string {
    const formats = options.formats || this.config.imageOptimization.formats;
    const breakpoints = options.breakpoints || this.config.imageOptimization.breakpoints;
    const quality = options.quality || this.config.imageOptimization.quality;

    const srcSetParts: string[] = [];

    formats.forEach(format => {
      breakpoints.forEach(breakpoint => {
        const optimizedUrl = this.optimizeImage(originalUrl, {
          width: breakpoint,
          format,
          quality,
        });
        srcSetParts.push(`${optimizedUrl} ${breakpoint}w`);
      });
    });

    return srcSetParts.join(', ');
  }

  // Preload critical assets
  async preloadAssets(assets: string[]): Promise<void> {
    const preloadPromises = assets.map(async (asset) => {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = this.getAssetType(asset);
        link.href = asset;
        link.crossOrigin = 'anonymous';
        
        document.head.appendChild(link);
        
        // Wait for the asset to load
        return new Promise<void>((resolve, reject) => {
          link.onload = () => resolve();
          link.onerror = () => reject(new Error(`Failed to preload ${asset}`));
        });
      } catch (error) {
        console.warn(`Failed to preload asset: ${asset}`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  // Get asset type for preloading
  private getAssetType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return 'script';
      case 'css':
        return 'style';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'avif':
      case 'gif':
      case 'svg':
        return 'image';
      default:
        return 'fetch';
    }
  }

  // Cache optimized asset
  cacheAsset(key: string, asset: OptimizedAsset): void {
    if (this.config.caching.enabled) {
      this.cache.set(key, asset);
      
      // Set expiration
      setTimeout(() => {
        this.cache.delete(key);
      }, this.config.caching.ttl);
    }
  }

  // Get cached asset
  getCachedAsset(key: string): OptimizedAsset | undefined {
    return this.cache.get(key);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Optimize CSS delivery
  optimizeCSS(cssUrl: string): string {
    const region = this.getNearestRegion();
    return `${this.config.baseUrl}/${region}/css?url=${encodeURIComponent(cssUrl)}&minify=true`;
  }

  // Optimize JavaScript delivery
  optimizeJS(jsUrl: string): string {
    const region = this.getNearestRegion();
    return `${this.config.baseUrl}/${region}/js?url=${encodeURIComponent(jsUrl)}&minify=true`;
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<{
    latency: number;
    throughput: number;
    region: string;
  }> {
    const region = this.getNearestRegion();
    const startTime = performance.now();
    
    try {
      // Measure latency to CDN
      const response = await fetch(`${this.config.baseUrl}/${region}/ping`);
      const latency = performance.now() - startTime;
      
      return {
        latency,
        throughput: response.headers.get('x-throughput') ? 
          parseInt(response.headers.get('x-throughput')!) : 0,
        region,
      };
    } catch (error) {
      console.warn('Failed to get CDN performance metrics:', error);
      return {
        latency: 0,
        throughput: 0,
        region,
      };
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): CDNConfig {
    return { ...this.config };
  }
}

// Default CDN configuration
const defaultConfig: CDNConfig = {
  baseUrl: 'https://cdn.plpe.com',
  imageOptimization: {
    enabled: true,
    formats: ['webp', 'avif', 'original'],
    quality: 80,
    breakpoints: [320, 640, 768, 1024, 1280, 1920],
  },
  caching: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
};

// Create singleton instance
export const cdnService = new CDNService(defaultConfig);

// Export types and utilities
export type { CDNConfig, OptimizedAsset };
export { CDNService }; 