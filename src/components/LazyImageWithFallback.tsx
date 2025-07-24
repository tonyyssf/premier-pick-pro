import React from 'react';
import { useLazyImage } from '@/hooks/usePerformanceOptimization';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
}

export const LazyImageWithFallback: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+',
  className,
  width,
  height,
}) => {
  const { imageSrc, isLoaded, hasError, imageRef } = useLazyImage(src, placeholder);

  const displaySrc = hasError ? fallbackSrc : imageSrc;

  return (
    <div 
      ref={imageRef}
      className={cn(
        'transition-opacity duration-300',
        isLoaded && !hasError ? 'opacity-100' : 'opacity-75',
        className
      )}
      style={{ width, height }}
    >
      <img
        src={displaySrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
    </div>
  );
};