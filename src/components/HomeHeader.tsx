
import React from 'react';
import { Bell, User } from 'lucide-react';

export const HomeHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold">Pick'Em</h1>
      <div className="flex items-center space-x-3">
        <Bell className="w-6 h-6" />
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
