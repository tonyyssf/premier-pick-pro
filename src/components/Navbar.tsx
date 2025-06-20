
import React from 'react';
import { Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
            
            {user && (
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-gray-700 hover:text-plpe-purple border-gray-300 hover:border-plpe-purple"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
