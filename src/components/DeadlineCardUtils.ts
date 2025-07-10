
import { Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { TimeRemaining, UrgencyLevel, CardStyle } from './DeadlineCardTypes';

export const calculateTimeRemaining = (deadline: Date): TimeRemaining => {
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

export const getUrgencyLevel = (timeRemaining: TimeRemaining): UrgencyLevel => {
  const { totalMs } = timeRemaining;
  const hoursRemaining = totalMs / (1000 * 60 * 60);

  if (totalMs <= 0) return 'expired';
  if (hoursRemaining <= 1) return 'critical';
  if (hoursRemaining <= 4) return 'urgent';
  if (hoursRemaining <= 24) return 'warning';
  return 'normal';
};

export const getCardStyle = (urgency: UrgencyLevel): CardStyle => {
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

export const formatTimeUnit = (value: number, unit: string, isMobile: boolean = false): string => {
  if (isMobile) {
    // Use short format for mobile: "d" for days, "h" for hours
    const shortUnit = unit === 'day' ? 'd' : unit === 'hour' ? 'h' : unit === 'minute' ? 'm' : 's';
    return `${value} ${shortUnit}`;
  }
  return `${value} ${unit}${value !== 1 ? 's' : ''}`;
};

export const getTimeDisplay = (timeRemaining: TimeRemaining, isMobile: boolean = false): string => {
  const { days, hours, minutes, seconds, totalMs } = timeRemaining;

  if (totalMs <= 0) {
    return 'Deadline passed';
  }

  if (days > 0) {
    return `${formatTimeUnit(days, 'day', isMobile)} ${formatTimeUnit(hours, 'hour', isMobile)}`;
  } else if (hours > 0) {
    return `${formatTimeUnit(hours, 'hour', isMobile)} ${formatTimeUnit(minutes, 'minute', isMobile)}`;
  } else {
    return `${formatTimeUnit(minutes, 'minute', isMobile)} ${formatTimeUnit(seconds, 'second', isMobile)}`;
  }
};

export const getUrgencyMessage = (urgency: UrgencyLevel): string => {
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
