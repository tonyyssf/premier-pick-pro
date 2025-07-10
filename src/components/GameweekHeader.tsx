
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Gameweek } from '@/types/picks';

interface GameweekHeaderProps {
  gameweek: Gameweek;
  title: string;
}

export const GameweekHeader: React.FC<GameweekHeaderProps> = ({ gameweek, title }) => {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center space-x-2 text-plpe-purple mb-2">
        <Calendar className="h-5 w-5" />
        <span className="font-semibold">Gameweek {gameweek.number}</span>
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
