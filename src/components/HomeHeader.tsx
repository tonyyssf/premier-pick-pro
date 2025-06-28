
import React from 'react';
import { Bell, User } from 'lucide-react';

export const HomeHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-plpe-gradient header text-plpe-white">
      <img 
        src="/lovable-uploads/a41eeb85-52f4-4a19-83df-3c26c3ba746b.png" 
        alt="PLPE Logo" 
        className="h-8 w-auto"
      />
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6" />
        <div className="w-10 h-10 rounded-full bg-plpe-neutral-700 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
