
import React, { useState } from 'react';
import { Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserSettingsDialog } from '@/components/UserSettingsDialog';

export const MobileNavbar: React.FC = () => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const baseNavigationItems = [
    { to: "/how-to-play", label: "How to Play", icon: "📖" },
    { to: "/", label: "My Picks", icon: "⚽" },
    { to: "/leagues", label: "Leagues", icon: "🏆" },
    { to: "/leaderboards", label: "Leaderboards", icon: "📊" }
  ];

  const navigationItems = isAdmin 
    ? [...baseNavigationItems, { to: "/admin", label: "Admin", icon: "⚙️" }]
    : baseNavigationItems;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile-first header */}
      <header className="bg-white shadow-lg border-b-4 border-plpe-purple sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - responsive sizing */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/4daf5c45-5994-4a33-a05e-7b987e09ed78.png" 
                alt="PLPE Logo" 
                className="h-16 sm:h-20 lg:h-24 w-auto"
              />
            </div>
            
            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className={`font-medium transition-colors min-tap-target flex items-center gap-2 ${
                    isActive(item.to) 
                      ? 'text-plpe-purple border-b-2 border-plpe-purple pb-1' 
                      : 'text-gray-700 hover:text-plpe-purple'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu and settings */}
            <div className="flex items-center space-x-2">
              {/* Settings button - always visible */}
              <Button 
                onClick={() => setSettingsOpen(true)}
                variant="ghost" 
                size="icon"
                className="min-tap-target text-gray-600 hover:text-plpe-purple transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="min-tap-target text-gray-600 hover:text-plpe-purple"
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 sm:w-96">
                    <div className="flex flex-col space-y-2 mt-8">
                      {navigationItems.map((item) => (
                        <Link 
                          key={item.to}
                          to={item.to}
                          onClick={closeMobileMenu}
                          className={`font-medium text-lg py-4 px-6 rounded-lg transition-colors min-tap-target flex items-center gap-3 ${
                            isActive(item.to) 
                              ? 'text-plpe-purple bg-purple-50 border-l-4 border-plpe-purple' 
                              : 'text-gray-700 hover:text-plpe-purple hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      
                      {user && (
                        <div className="border-t pt-6 mt-8 space-y-3">
                          <Button 
                            onClick={() => {
                              handleSignOut();
                              closeMobileMenu();
                            }}
                            variant="outline"
                            size="lg"
                            className="w-full min-tap-target flex items-center justify-center space-x-3 text-gray-700 hover:text-plpe-purple border-gray-300 hover:border-plpe-purple py-4"
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="text-lg">Sign Out</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop sign out - hidden on mobile */}
              {user && (
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex items-center space-x-2 text-gray-700 hover:text-plpe-purple border-gray-300 hover:border-plpe-purple min-tap-target"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navigationItems.slice(0, 4).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-colors min-tap-target ${
                isActive(item.to)
                  ? 'text-plpe-purple bg-purple-50'
                  : 'text-gray-600 hover:text-plpe-purple hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      <UserSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </>
  );
};
