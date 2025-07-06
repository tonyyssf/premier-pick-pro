
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
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

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const getCardStyle = () => {
    const { totalMs } = timeRemaining;
    const hoursRemaining = totalMs / (1000 * 60 * 60);

    if (totalMs <= 0) {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        icon: CheckCircle
      };
    } else if (hoursRemaining <= 2) {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        icon: AlertTriangle
      };
    } else if (hoursRemaining <= 24) {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        icon: Clock
      };
    } else {
      return {
        bgColor: 'bg-plpe-purple/5',
        borderColor: 'border-plpe-purple/20',
        textColor: 'text-plpe-purple',
        iconColor: 'text-plpe-purple',
        icon: Clock
      };
    }
  };

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  const getTimeDisplay = () => {
    const { days, hours, minutes, seconds, totalMs } = timeRemaining;

    if (totalMs <= 0) {
      return 'Deadline has passed';
    }

    if (days > 0) {
      return `${formatTimeUnit(days, 'day')} ${formatTimeUnit(hours, 'hour')}`;
    } else if (hours > 0) {
      return `${formatTimeUnit(hours, 'hour')} ${formatTimeUnit(minutes, 'minute')}`;
    } else {
      return `${formatTimeUnit(minutes, 'minute')} ${formatTimeUnit(seconds, 'second')}`;
    }
  };

  const getDeadlineMessage = () => {
    const { totalMs } = timeRemaining;

    if (totalMs <= 0) {
      return 'No more picks can be made for this gameweek';
    }

    return 'Time remaining to make your pick';
  };

  const style = getCardStyle();
  const IconComponent = style.icon;

  return (
    <Card className={`${style.bgColor} ${style.borderColor} border-l-4 mb-6`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconComponent className={`h-6 w-6 ${style.iconColor}`} />
            <div>
              <h3 className={`text-lg font-semibold ${style.textColor}`}>
                Gameweek {gameweekNumber} Deadline
              </h3>
              <p className={`text-sm ${style.textColor}/80`}>
                {getDeadlineMessage()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${style.textColor} font-mono`}>
              {getTimeDisplay()}
            </div>
            <p className={`text-sm ${style.textColor}/80`}>
              {deadline.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
