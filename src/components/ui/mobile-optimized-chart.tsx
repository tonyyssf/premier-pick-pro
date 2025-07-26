import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

interface MobileOptimizedChartProps {
  children: ReactNode;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export const MobileOptimizedChart: React.FC<MobileOptimizedChartProps> = ({
  children,
  className,
  enableZoom = true,
  enablePan = true,
  minZoom = 0.5,
  maxZoom = 3
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle pinch-to-zoom
  useEffect(() => {
    if (!enableZoom || !containerRef.current) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const newScale = Math.max(minZoom, Math.min(maxZoom, 
          (currentDistance / initialDistance) * initialScale
        ));
        setScale(newScale);
      }
    };

    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enableZoom, scale, minZoom, maxZoom]);

  // Handle pan gestures
  const handlePan = (event: any, info: PanInfo) => {
    if (!enablePan) return;
    
    setPosition({
      x: position.x + info.delta.x,
      y: position.y + info.delta.y
    });
  };

  const handlePanStart = () => setIsDragging(true);
  const handlePanEnd = () => setIsDragging(false);

  // Reset zoom and pan
  const handleDoubleTap = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden touch-pan-y", className)}
      onDoubleClick={handleDoubleTap}
    >
      <motion.div
        drag={enablePan}
        dragConstraints={containerRef}
        onPan={handlePan}
        onPanStart={handlePanStart}
        onPanEnd={handlePanEnd}
        style={{
          scale,
          x: position.x,
          y: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="origin-center"
      >
        {children}
      </motion.div>
      
      {/* Zoom controls for mobile */}
      {enableZoom && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setScale(Math.min(maxZoom, scale + 0.2))}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(minZoom, scale - 0.2))}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
          >
            −
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors text-sm"
          >
            ↺
          </button>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized tooltip
export const MobileTooltip: React.FC<{
  children: ReactNode;
  isVisible: boolean;
  position?: { x: number; y: number };
  className?: string;
}> = ({ children, isVisible, position, className }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (position) {
      setTooltipPosition(position);
    }
  }, [position]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed z-50 bg-black/90 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none",
            "max-w-xs break-words",
            className
          )}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 40,
            transform: 'translateX(-50%)'
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Mobile-friendly chart container
export const MobileChartContainer: React.FC<{
  children: ReactNode;
  title?: string;
  className?: string;
}> = ({ children, title, className }) => (
  <div className={cn("bg-white rounded-lg shadow-sm border", className)}>
    {title && (
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
); 