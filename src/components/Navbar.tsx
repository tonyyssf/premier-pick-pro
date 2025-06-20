

import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b-4 border-plpe-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/4daf5c45-5994-4a33-a05e-7b987e09ed78.png" 
              alt="PLPE Logo" 
              className="h-24 w-auto"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${
                isActive('/') 
                  ? 'text-plpe-purple border-b-2 border-plpe-purple pb-1' 
                  : 'text-gray-700 hover:text-plpe-purple'
              }`}
            >
              My Picks
            </Link>
            <Link 
              to="/leagues" 
              className={`font-medium transition-colors ${
                isActive('/leagues') 
                  ? 'text-plpe-purple border-b-2 border-plpe-purple pb-1' 
                  : 'text-gray-700 hover:text-plpe-purple'
              }`}
            >
              Leagues
            </Link>
            <Link 
              to="/leaderboards" 
              className={`font-medium transition-colors ${
                isActive('/leaderboards') 
                  ? 'text-plpe-purple border-b-2 border-plpe-purple pb-1' 
                  : 'text-gray-700 hover:text-plpe-purple'
              }`}
            >
              Leaderboards
            </Link>
            <Link 
              to="/admin" 
              className={`font-medium transition-colors ${
                isActive('/admin') 
                  ? 'text-plpe-purple border-b-2 border-plpe-purple pb-1' 
                  : 'text-gray-700 hover:text-plpe-purple'
              }`}
            >
              Admin
            </Link>
          </div>

          <div className="flex items-center space-x-4">
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
