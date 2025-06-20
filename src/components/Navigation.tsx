import { useState } from 'react';
import { Menu, X, Play, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'AI Image Studio', href: '/image-studio' },
    { name: 'Video Ad Service', href: '/video-service' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/contact');
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isOnDashboard = location.pathname === '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl shadow-xl border-b border-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 animate-fade-in cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300 hover:shadow-primary/25">
              <Play className="w-6 h-6 text-white" />
            </div>
            <span className="font-montserrat font-bold text-2xl text-white tracking-tight">
              medianode.ai
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="font-opensans text-gray-300 hover:text-primary transition-all duration-300 relative group animate-slide-in-left text-lg font-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.name}
                <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
              </button>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4 animate-slide-in-right">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-primary transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-opensans">{user.user_metadata?.name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem
                    onClick={() => navigate('/dashboard')}
                    className="hover:bg-gray-700 cursor-pointer"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-gray-700 cursor-pointer text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => window.location.href = '/auth'}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-opensans font-semibold px-4 py-2 rounded-2xl transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-6 py-2 rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-primary transition-colors duration-300 p-2"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800/30 animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left px-4 py-3 text-gray-300 hover:text-primary font-opensans transition-colors duration-300 text-lg rounded-2xl hover:bg-black/70 border border-transparent hover:border-gray-800/50"
              >
                {item.name}
              </button>
            ))}

            {/* Mobile Auth Section */}
            <div className="px-4 pt-2 space-y-3">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:text-white font-opensans py-3 rounded-2xl"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-red-600 text-red-400 hover:text-red-300 font-opensans py-3 rounded-2xl"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.href = '/auth'}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 font-opensans font-semibold py-3 rounded-2xl transition-all duration-300"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold py-3 rounded-2xl transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </nav>
  );
};

export default Navigation;
