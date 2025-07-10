
import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Gameweek } from '@/types/picks';

interface GameweekHeaderProps {
  gameweek: Gameweek;
  title: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  isNavigating?: boolean;
}

export const GameweekHeader: React.FC<GameweekHeaderProps> = ({ 
  gameweek, 
  title, 
  onNavigate,
  canNavigatePrev = false,
  canNavigateNext = false,
  isNavigating = false
}) => {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center space-x-2 text-plpe-purple mb-2">
        <Calendar className="h-5 w-5" />
        <div className="flex items-center space-x-4">
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={!canNavigatePrev || isNavigating}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <span className="font-semibold">Gameweek {gameweek.number}</span>
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={!canNavigateNext || isNavigating}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <div className="flex items-center justify-center space-x-2 text-gray-600">
        <Clock className="h-4 w-4" />
        <span>Deadline: {gameweek.deadline.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>
    </div>
  );
};
