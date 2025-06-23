
import React from 'react';
import { GoogleAd } from './GoogleAd';

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, className = '' }) => {
  const getAdSlot = () => {
    switch (position) {
      case 'top': return '1234567890'; // Replace with actual slot IDs
      case 'bottom': return '0987654321';
      case 'sidebar': return '1122334455';
      default: return '1234567890';
    }
  };

  const getAdStyle = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return { width: '100%', height: '90px' };
      case 'sidebar':
        return { width: '300px', height: '250px' };
      default:
        return { width: '100%', height: '90px' };
    }
  };

  return (
    <div className={`ad-banner ad-banner-${position} ${className}`}>
      <div className="text-xs text-gray-500 text-center mb-1">Advertisement</div>
      <GoogleAd 
        slot={getAdSlot()}
        format={position === 'sidebar' ? 'rectangle' : 'horizontal'}
        style={getAdStyle()}
      />
    </div>
  );
};
