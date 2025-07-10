
import React from 'react';
import { CardStyle } from './DeadlineCardTypes';

interface DeadlineCardIconProps {
  style: CardStyle;
}

export const DeadlineCardIcon: React.FC<DeadlineCardIconProps> = ({ style }) => {
  const IconComponent = style.icon;

  return (
    <div className={`p-3 rounded-full ${style.bgColor} ${style.borderColor} border-2`}>
      <IconComponent className={`h-8 w-8 ${style.iconColor}`} />
    </div>
  );
};
