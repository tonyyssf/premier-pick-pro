import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedChartProps {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  animationDelay?: number;
  chartType?: 'heatmap' | 'line' | 'bar' | 'area';
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
  children,
  isLoading = false,
  className,
  animationDelay = 0,
  chartType = 'line'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsVisible(true), animationDelay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isLoading, animationDelay]);

  const getChartAnimation = () => {
    switch (chartType) {
      case 'heatmap':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 0.6, ease: "easeOut" }
        };
      case 'line':
      case 'area':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration: 0.5, ease: "easeOut" }
        };
      case 'bar':
        return {
          initial: { opacity: 0, scaleY: 0 },
          animate: { opacity: 1, scaleY: 1 },
          exit: { opacity: 0, scaleY: 0 },
          transition: { duration: 0.4, ease: "easeOut" }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
    }
  };

  const animation = getChartAnimation();

  return (
    <AnimatePresence mode="wait">
      {isVisible && !isLoading ? (
        <motion.div
          key="chart"
          className={cn("w-full", className)}
          {...animation}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="loading"
          className={cn("w-full", className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Loading placeholder will be handled by parent component */}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated chart elements for individual chart components
export const AnimatedChartElement: React.FC<{
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.3, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration,
      delay,
      ease: "easeOut"
    }}
  >
    {children}
  </motion.div>
);

// Animated tooltip for chart interactions
export const AnimatedTooltip: React.FC<{
  children: ReactNode;
  isVisible: boolean;
  className?: string;
}> = ({ children, isVisible, className }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Animated chart legend
export const AnimatedLegend: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    {children}
  </motion.div>
); 