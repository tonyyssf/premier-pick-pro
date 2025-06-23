
import React from 'react';
import { Navbar } from './Navbar';
import { AdBanner } from './AdBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      {/* Top banner ad */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AdBanner position="top" className="flex justify-center" />
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar ad for larger screens */}
        <aside className="hidden xl:block w-80 p-4">
          <div className="sticky top-4 space-y-6">
            <AdBanner position="sidebar" />
            <AdBanner position="sidebar" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>

        {/* Right sidebar ad */}
        <aside className="hidden xl:block w-80 p-4">
          <div className="sticky top-4 space-y-6">
            <AdBanner position="sidebar" />
            <AdBanner position="sidebar" />
          </div>
        </aside>
      </div>

      {/* Bottom banner ad */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AdBanner position="bottom" className="flex justify-center" />
        </div>
      </footer>
    </div>
  );
};
