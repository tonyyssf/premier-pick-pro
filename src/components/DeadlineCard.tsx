
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { DeadlineCardProps, TimeRemaining } from './DeadlineCardTypes';
import { 
  calculateTimeRemaining, 
  getUrgencyLevel, 
  getCardStyle, 
  getTimeDisplay, 
  getUrgencyMessage 
} from './DeadlineCardUtils';
import { DeadlineCardIcon } from './DeadlineCardIcon';
import { DeadlineCardTimer } from './DeadlineCardTimer';
import { DeadlineCardTip } from './DeadlineCardTip';

export const DeadlineCard: React.FC<DeadlineCardProps> = ({ deadline, gameweekNumber }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    totalMs: 0 
  });

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const urgency = getUrgencyLevel(timeRemaining);
  const style = getCardStyle(urgency);
  const timeDisplay = getTimeDisplay(timeRemaining);
  const urgencyMessage = getUrgencyMessage(urgency);

  return (
    <Card className={`
      ${style.bgColor} ${style.borderColor} border-l-4 mb-6 shadow-lg
      ${urgency === 'critical' ? 'ring-4 ' + style.ringColor : ''}
      ${urgency === 'urgent' ? 'ring-2 ' + style.ringColor : ''}
    `}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <DeadlineCardIcon style={style} />
            <div>
              <h3 className={`text-xl font-bold ${style.textColor} mb-1`}>
                Gameweek {gameweekNumber} Deadline
              </h3>
              <p className={`text-sm ${style.textColor}/80 font-medium`}>
                {urgencyMessage}
              </p>
              {urgency === 'critical' && (
                <p className="text-sm font-bold text-red-700 mt-1 animate-pulse">
                  ⚡ Make your pick immediately!
                </p>
              )}
            </div>
          </div>
          
          <DeadlineCardTimer
            timeDisplay={timeDisplay}
            deadline={deadline}
            timeRemaining={timeRemaining}
            urgency={urgency}
            textColor={style.textColor}
          />
        </div>
        
        <DeadlineCardTip urgency={urgency} style={style} />
      </CardContent>
    </Card>
  );
};
