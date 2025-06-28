
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // All navigation items are now public
  const navigationItems = [
    { to: "/how-to-play", label: "How to Play" },
    { to: "/", label: "My Picks" },
    { to: "/leagues", label: "Leagues" },
    { to: "/leaderboards", label: "Leaderboards" },
    { to: "/admin", label: "Admin" }
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-plpe-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/4daf5c45-5994-4a33-a05e-7b987e09ed78.png" 
                alt="PLPE Logo" 
                className="h-24 w-auto"
              />
            </Link>
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
