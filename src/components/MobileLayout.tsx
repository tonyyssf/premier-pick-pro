
import React from 'react';
import { MobileNavbar } from './MobileNavbar';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <MobileNavbar />
      
      {/* Main content with mobile-first spacing */}
      <main className="pb-20 sm:pb-4">
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};
