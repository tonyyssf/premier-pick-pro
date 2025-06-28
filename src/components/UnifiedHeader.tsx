
import React from 'react';
import { Bell, User } from 'lucide-react';

interface UnifiedHeaderProps {
  title?: string;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({ title = "PLPE" }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-plpe-gradient header text-plpe-white">
      <h1 className="text-xl font-bold text-white">{title}</h1>
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6" />
        <div className="w-10 h-10 rounded-full bg-plpe-neutral-700 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
