
import React from 'react';
import { Users, BarChart3, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg border-b-4 border-plpe-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/4daf5c45-5994-4a33-a05e-7b987e09ed78.png" 
              alt="PLPE Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold bg-plpe-gradient bg-clip-text text-transparent">
              Pick'em
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-plpe-purple font-medium transition-colors">
              My Picks
            </a>
            <a href="#" className="text-gray-700 hover:text-plpe-purple font-medium transition-colors">
              Leagues
            </a>
            <a href="#" className="text-gray-700 hover:text-plpe-purple font-medium transition-colors">
              Leaderboard
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-plpe-purple transition-colors">
              <Users className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-plpe-purple transition-colors">
              <BarChart3 className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-plpe-purple transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
