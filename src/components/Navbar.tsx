
import React, { useState } from 'react';
import { Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserSettingsDialog } from '@/components/UserSettingsDialog';

export const Navbar: React.FC = () => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  // Filter navigation items based on admin status
  const baseNavigationItems = [
    { to: "/how-to-play", label: "How to Play" },
    { to: "/", label: "My Picks" },
    { to: "/leaderboards", label: "Leagues & Rankings" }
  ];

  const navigationItems = isAdmin 
    ? [...baseNavigationItems, { to: "/admin", label: "Admin" }]
    : baseNavigationItems;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                className={`font-medium transition-colors ${
                  isActive(item.to) 
                    ? 'text-plpe-purple border-b-2 border-plpe-purple pb-1' 
                    : 'text-gray-700 hover:text-plpe-purple'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-plpe-purple">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigationItems.map((item) => (
                      <Link 
                        key={item.to}
                        to={item.to}
                        onClick={closeMobileMenu}
                        className={`font-medium text-lg py-2 px-4 rounded-lg transition-colors ${
                          isActive(item.to) 
                            ? 'text-plpe-purple bg-purple-50' 
                            : 'text-gray-700 hover:text-plpe-purple hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                    
                    {user && (
                      <div className="border-t pt-4 mt-6 space-y-2">
                        <Button 
                          onClick={() => {
                            setSettingsOpen(true);
                            closeMobileMenu();
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-plpe-purple border-gray-300 hover:border-plpe-purple"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            handleSignOut();
                            closeMobileMenu();
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-plpe-purple border-gray-300 hover:border-plpe-purple"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Settings and Sign Out */}
            <Button 
              onClick={() => setSettingsOpen(true)}
              variant="ghost" 
              size="icon"
              className="hidden md:block p-2 text-gray-600 hover:text-plpe-purple transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            {user && (
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-plpe-purple border-gray-300 hover:border-plpe-purple"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <UserSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </nav>
  );
};
