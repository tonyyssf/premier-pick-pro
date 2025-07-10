
import React from 'react';
import { UrgencyLevel, CardStyle } from './DeadlineCardTypes';

interface DeadlineCardTipProps {
  urgency: UrgencyLevel;
  style: CardStyle;
}

export const DeadlineCardTip: React.FC<DeadlineCardTipProps> = ({ urgency, style }) => {
  if (urgency !== 'urgent' && urgency !== 'critical') {
    return null;
  }

  return (
    <div className={`mt-4 p-3 rounded-lg ${style.bgColor} border ${style.borderColor}`}>
      <p className={`text-sm ${style.textColor} font-medium text-center`}>
        💡 Tip: Your pick will be locked when the first match of this gameweek starts
      </p>
    </div>
  );
};
