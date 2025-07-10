
export interface DeadlineCardProps {
  deadline: Date;
  gameweekNumber: number;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export type UrgencyLevel = 'expired' | 'critical' | 'urgent' | 'warning' | 'normal';

export interface CardStyle {
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  icon: any;
  ringColor: string;
}
