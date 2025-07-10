
import React from 'react';
import { TimeRemaining, UrgencyLevel } from './DeadlineCardTypes';

interface DeadlineCardTimerProps {
  timeDisplay: string;
  deadline: Date;
  timeRemaining: TimeRemaining;
  urgency: UrgencyLevel;
  textColor: string;
  isMobile?: boolean;
}

export const DeadlineCardTimer: React.FC<DeadlineCardTimerProps> = ({
  timeDisplay,
  deadline,
  timeRemaining,
  urgency,
  textColor,
  isMobile = false
}) => {
  return (
    <div className="text-right">
      <div className={`text-3xl font-bold ${textColor} font-mono mb-2`}>
        {timeDisplay}
      </div>
      <div className={`text-sm ${textColor}/80 mb-2`}>
        {deadline.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      
      {/* Progress bar for urgency - hidden on mobile */}
      {urgency !== 'expired' && !isMobile && (
        <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              urgency === 'critical' ? 'bg-red-500' :
              urgency === 'urgent' ? 'bg-orange-500' :
              urgency === 'warning' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ 
              width: `${Math.max(10, Math.min(100, (timeRemaining.totalMs / (1000 * 60 * 60 * 24)) * 100))}%` 
            }}
          />
        </div>
      )}
    </div>
  );
};
