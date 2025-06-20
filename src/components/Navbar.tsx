
import React from 'react';
import { Trophy, Users, BarChart3, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg border-b-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">PL Pick'em</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              My Picks
            </a>
            <a href="#" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Leagues
            </a>
            <a href="#" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
              Leaderboard
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
              <Users className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
              <BarChart3 className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
