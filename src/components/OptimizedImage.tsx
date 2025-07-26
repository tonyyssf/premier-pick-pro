import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  isInView: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  width,
  height,
  className,
  placeholder = '/placeholder.svg',
  loading = 'lazy',
  sizes = '100vw',
  quality = 80,
  format = 'webp',
  priority = false,
  onLoad,
  onError,
  fallback,
}) => {
  const [state, setState] = useState<ImageState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    isInView: false,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const generateOptimizedUrl = useCallback((imageSrc: string, targetFormat?: string) => {
    // If it's already a data URL or external CDN, return as is
    if (imageSrc.startsWith('data:') || imageSrc.startsWith('http')) {
      return imageSrc;
    }

    // For local images, we could integrate with an image optimization service
    // For now, return the original src
    return imageSrc;
  }, []);

  // Generate responsive srcset
  const generateSrcSet = useCallback((imageSrc: string) => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    const densities = [1, 2]; // 1x and 2x for retina displays

    return densities
      .map(density => 
        breakpoints
          .map(breakpoint => {
            const optimizedUrl = generateOptimizedUrl(imageSrc, format);
            return `${optimizedUrl}?w=${breakpoint * density}&q=${quality}&f=${format} ${breakpoint * density}w`;
          })
          .join(', ')
      )
      .join(', ');
  }, [generateOptimizedUrl, format, quality]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setState(prev => ({ ...prev, isInView: true }));
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, isInView: true }));
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, loading]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false, isLoaded: true }));
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false, hasError: true }));
    
    // Try fallback image
    if (fallback && imgRef.current) {
      imgRef.current.src = fallback;
    }
    
    onError?.();
  }, [fallback, onError]);

  // Start loading when in view
  useEffect(() => {
    if (state.isInView && !state.isLoaded && !state.hasError) {
      setState(prev => ({ ...prev, isLoading: true }));
    }
  }, [state.isInView, state.isLoaded, state.hasError]);

  // Generate final image URL
  const finalSrc = state.isInView ? generateOptimizedUrl(src, format) : placeholder;
  const srcSet = state.isInView ? generateSrcSet(src) : undefined;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error placeholder */}
      {state.hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        loading={loading}
        className={cn(
          'transition-opacity duration-300',
          state.isLoaded ? 'opacity-100' : 'opacity-0',
          state.hasError ? 'hidden' : 'block'
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      />

      {/* WebP support indicator */}
      {format === 'webp' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (!document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0) {
                // WebP not supported, could load fallback
              }
            `,
          }}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Hook for image optimization
export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState<boolean | null>(null);
  const [isAvifSupported, setIsAvifSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Check WebP support
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = () => {
      setIsWebPSupported(webpTest.width === 1);
    };
    webpTest.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAADsAD+JaQAA3AAAAAA';

    // Check AVIF support
    const avifTest = new Image();
    avifTest.onload = avifTest.onerror = () => {
      setIsAvifSupported(avifTest.width === 1);
    };
    avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }, []);

  const getOptimalFormat = useCallback(() => {
    if (isAvifSupported) return 'avif';
    if (isWebPSupported) return 'webp';
    return 'original';
  }, [isAvifSupported, isWebPSupported]);

  return {
    isWebPSupported,
    isAvifSupported,
    getOptimalFormat,
  };
}; 