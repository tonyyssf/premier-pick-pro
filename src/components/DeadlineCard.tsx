
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface DeadlineCardProps {
  deadline: Date;
  gameweekNumber: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({ deadline, gameweekNumber }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    totalMs: 0 
  });

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, totalMs: diffMs };
  };

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const getUrgencyLevel = () => {
    const { totalMs } = timeRemaining;
    const hoursRemaining = totalMs / (1000 * 60 * 60);

    if (totalMs <= 0) return 'expired';
    if (hoursRemaining <= 1) return 'critical';
    if (hoursRemaining <= 4) return 'urgent';
    if (hoursRemaining <= 24) return 'warning';
    return 'normal';
  };

  const getCardStyle = () => {
    const urgency = getUrgencyLevel();
    
    switch (urgency) {
      case 'expired':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-400',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          icon: CheckCircle,
          ringColor: 'ring-red-200'
        };
      case 'critical':
        return {
          bgColor: 'bg-red-50 animate-pulse',
          borderColor: 'border-red-500',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          icon: Zap,
          ringColor: 'ring-red-300'
        };
      case 'urgent':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-400',
          textColor: 'text-orange-900',
          iconColor: 'text-orange-600',
          icon: AlertTriangle,
          ringColor: 'ring-orange-200'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          icon: Clock,
          ringColor: 'ring-yellow-200'
        };
      default:
        return {
          bgColor: 'bg-plpe-purple/5',
          borderColor: 'border-plpe-purple/30',
          textColor: 'text-plpe-purple',
          iconColor: 'text-plpe-purple',
          icon: Clock,
          ringColor: 'ring-plpe-purple/20'
        };
    }
  };

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  const getTimeDisplay = () => {
    const { days, hours, minutes, seconds, totalMs } = timeRemaining;

    if (totalMs <= 0) {
      return 'Deadline passed';
    }

    if (days > 0) {
      return `${formatTimeUnit(days, 'day')} ${formatTimeUnit(hours, 'hour')}`;
    } else if (hours > 0) {
      return `${formatTimeUnit(hours, 'hour')} ${formatTimeUnit(minutes, 'minute')}`;
    } else {
      return `${formatTimeUnit(minutes, 'minute')} ${formatTimeUnit(seconds, 'second')}`;
    }
  };

  const getUrgencyMessage = () => {
    const urgency = getUrgencyLevel();
    
    switch (urgency) {
      case 'expired':
        return 'Deadline has passed - no more picks can be made';
      case 'critical':
        return 'URGENT: Less than 1 hour remaining!';
      case 'urgent':
        return 'Deadline approaching soon - make your pick now!';
      case 'warning':
        return 'Deadline today - don\'t forget to make your pick';
      default:
        return 'Time remaining to make your pick';
    }
  };

  const style = getCardStyle();
  const IconComponent = style.icon;
  const urgency = getUrgencyLevel();

  return (
    <Card className={`
      ${style.bgColor} ${style.borderColor} border-l-4 mb-6 shadow-lg
      ${urgency === 'critical' ? 'ring-4 ' + style.ringColor : ''}
      ${urgency === 'urgent' ? 'ring-2 ' + style.ringColor : ''}
    `}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${style.bgColor} ${style.borderColor} border-2`}>
              <IconComponent className={`h-8 w-8 ${style.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${style.textColor} mb-1`}>
                Gameweek {gameweekNumber} Deadline
              </h3>
              <p className={`text-sm ${style.textColor}/80 font-medium`}>
                {getUrgencyMessage()}
              </p>
              {urgency === 'critical' && (
                <p className="text-sm font-bold text-red-700 mt-1 animate-pulse">
                  ⚡ Make your pick immediately!
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${style.textColor} font-mono mb-2`}>
              {getTimeDisplay()}
            </div>
            <div className={`text-sm ${style.textColor}/80 mb-2`}>
              {deadline.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            {/* Progress bar for urgency */}
            {urgency !== 'expired' && (
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
        </div>
        
        {/* Additional context for mobile users */}
        {urgency === 'urgent' || urgency === 'critical' ? (
          <div className={`mt-4 p-3 rounded-lg ${style.bgColor} border ${style.borderColor}`}>
            <p className={`text-sm ${style.textColor} font-medium text-center`}>
              💡 Tip: Your pick will be locked when the first match of this gameweek starts
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
